import { OutboxProcessor } from './outbox.processor';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { RabbitMQService } from '@app/queue/rabbitmq.service';
import {
  OutboxEvent,
  OutboxStatus,
} from '@app/database/entities/outbox-event.entity';

type OutboxProcessorPrivate = {
  processEvent: (event: OutboxEvent) => Promise<void>;
  calculateNextRetry: (attempts: number) => Date;
  lockBatch: (limit: number) => Promise<[OutboxEvent[], number]>;
};

type DataSourceMock = Pick<DataSource, 'query'>;
type RabbitMock = Pick<RabbitMQService, 'publish'>;

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

describe('OutboxProcessor', () => {
  let processor: OutboxProcessor;
  let processorPrivate: OutboxProcessorPrivate;
  let dataSourceMock: jest.Mocked<DataSourceMock>;
  let rabbitMock: jest.Mocked<RabbitMock>;

  const createEvent = (overrides?: Partial<OutboxEvent>): OutboxEvent => ({
    id: 'event-1',
    type: 'test.event',
    payload: { foo: 'bar' },
    attempts: 0,
    status: OutboxStatus.PENDING,
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    dataSourceMock = {
      query: jest.fn(),
    };

    rabbitMock = {
      publish: jest.fn(),
    };

    processor = new OutboxProcessor(
      dataSourceMock as unknown as DataSource,
      rabbitMock as unknown as RabbitMQService,
    );

    processorPrivate = processor as unknown as OutboxProcessorPrivate;

    jest.clearAllMocks();
  });

  it('should publish and mark as processed', async () => {
    rabbitMock.publish.mockResolvedValue(undefined);
    dataSourceMock.query.mockResolvedValue(undefined);

    const event = createEvent();

    await processorPrivate.processEvent(event);

    expect(rabbitMock.publish).toHaveBeenCalledTimes(1);
    expect(rabbitMock.publish).toHaveBeenCalledWith(event.type, event.payload);

    expect(dataSourceMock.query).toHaveBeenCalledWith(
      expect.stringContaining('set status = $1'),
      [OutboxStatus.PROCESSED, event.id],
    );
  });

  it('should retry on publish failure', async () => {
    rabbitMock.publish.mockRejectedValue(new Error('fail'));
    dataSourceMock.query.mockResolvedValue(undefined);
    const event = createEvent({ attempts: 1 });
    await processorPrivate.processEvent(event);
    expect(rabbitMock.publish).toHaveBeenCalledTimes(1);
    expect(dataSourceMock.query).toHaveBeenCalledWith(
      expect.stringContaining('"nextRetryAt"'),
      expect.arrayContaining([OutboxStatus.PENDING]),
    );
  });

  it('should mark as FAILED when max retries exceeded', async () => {
    rabbitMock.publish.mockRejectedValue(new Error('fail'));
    dataSourceMock.query.mockResolvedValue(undefined);
    const event = createEvent({ attempts: 5 });
    await processorPrivate.processEvent(event);
    expect(dataSourceMock.query).toHaveBeenCalledWith(
      expect.stringContaining('set status = $1'),
      [OutboxStatus.FAILED, 6, event.id],
    );
  });

  it('should calculate retry delays correctly', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const r1 = processorPrivate.calculateNextRetry(1);
    expect(r1.getTime()).toBe(now + 10_000);

    const r2 = processorPrivate.calculateNextRetry(2);
    expect(r2.getTime()).toBe(now + 60_000);

    const r3 = processorPrivate.calculateNextRetry(3);
    expect(r3.getTime()).toBe(now + 300_000);

    const r4 = processorPrivate.calculateNextRetry(10);
    expect(r4.getTime()).toBe(now + 900_000);
  });

  it('should process all events from batch', async () => {
    const events: OutboxEvent[] = [
      createEvent({ id: '1' }),
      createEvent({ id: '2' }),
    ];
    jest.spyOn(processorPrivate, 'lockBatch').mockResolvedValue([events, 2]);
    const processSpy = jest
      .spyOn(processorPrivate, 'processEvent')
      .mockResolvedValue(undefined);
    await processor.processBatch();
    expect(processSpy).toHaveBeenCalledTimes(2);
  });
});
