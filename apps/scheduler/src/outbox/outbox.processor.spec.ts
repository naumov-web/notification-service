import { OutboxProcessor } from './outbox.processor';
import { DataSource } from 'typeorm';
import { RabbitMQService } from '@app/queue/rabbitmq.service';
import { OutboxStatus } from '@app/database/entities/outbox-event.entity';
import { Logger } from '@nestjs/common';

beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
});

describe('OutboxProcessor', () => {
    let processor: OutboxProcessor;

    const dataSourceMock = {
        query: jest.fn(),
    } as unknown as DataSource;

    const rabbitMock = {
        publish: jest.fn(),
    } as unknown as RabbitMQService;

    beforeEach(() => {
        jest.clearAllMocks();
        processor = new OutboxProcessor(dataSourceMock, rabbitMock);
    });

    const baseEvent = {
        id: 'event-1',
        type: 'test.event',
        payload: { foo: 'bar' },
        attempts: 0,
    } as any;

    // 🟢 SUCCESS CASE
    it('should publish and mark as processed', async () => {
        rabbitMock.publish = jest.fn().mockResolvedValue(undefined);
        dataSourceMock.query = jest.fn().mockResolvedValue(undefined);

        await (processor as any).processEvent(baseEvent);

        expect(rabbitMock.publish).toHaveBeenCalledWith(
            baseEvent.type,
            baseEvent.payload,
        );

        expect(dataSourceMock.query).toHaveBeenCalledWith(
            expect.stringContaining('set status = $1'),
            [OutboxStatus.PROCESSED, baseEvent.id],
        );
    });

    // 🔴 PUBLISH FAIL → RETRY
    it('should retry on publish failure', async () => {
        rabbitMock.publish = jest.fn().mockRejectedValue(new Error('fail'));

        dataSourceMock.query = jest.fn().mockResolvedValue(undefined);

        await (processor as any).processEvent({
            ...baseEvent,
            attempts: 1,
        });

        expect(rabbitMock.publish).toHaveBeenCalled();

        expect(dataSourceMock.query).toHaveBeenCalledWith(
            expect.stringContaining('"nextRetryAt"'),
            expect.arrayContaining([OutboxStatus.PENDING]),
        );
    });

    // 🔴 MAX RETRIES → FAILED
    it('should mark as FAILED when max retries exceeded', async () => {
        rabbitMock.publish = jest.fn().mockRejectedValue(new Error('fail'));

        dataSourceMock.query = jest.fn().mockResolvedValue(undefined);

        await (processor as any).processEvent({
            ...baseEvent,
            attempts: 5,
        });

        expect(dataSourceMock.query).toHaveBeenCalledWith(
            expect.stringContaining('set status = $1'),
            [OutboxStatus.FAILED, 6, baseEvent.id],
        );
    });

    // 🧮 calculateNextRetry
    it('should calculate correct retry delay', () => {
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const retry = (processor as any).calculateNextRetry(1);
        expect(retry.getTime()).toBe(now + 10_000);

        const retry2 = (processor as any).calculateNextRetry(2);
        expect(retry2.getTime()).toBe(now + 60_000);

        const retry3 = (processor as any).calculateNextRetry(3);
        expect(retry3.getTime()).toBe(now + 300_000);

        const retry4 = (processor as any).calculateNextRetry(10);
        expect(retry4.getTime()).toBe(now + 900_000);
    });

    // 🟡 processBatch
    it('should process all events from batch', async () => {
        const events = [
            { ...baseEvent, id: '1' },
            { ...baseEvent, id: '2' },
        ];

        jest.spyOn(processor as any, 'lockBatch').mockResolvedValue([events, 2]);

        const spy = jest.spyOn(processor as any, 'processEvent').mockResolvedValue(undefined);

        await processor.processBatch();

        expect(spy).toHaveBeenCalledTimes(2);
    });
});