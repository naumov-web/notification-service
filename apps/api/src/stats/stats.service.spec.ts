import { StatsService } from './stats.service';
import { StatsItemDto } from './dto/stats-response.dto';

type ClickhouseResult = {
  json: () => Promise<StatsItemDto[]>;
};

type ClickhouseClientMock = {
  query: (args: { query: string; format: string }) => ClickhouseResult;
};

describe('StatsService', () => {
  let service: StatsService;
  let clientMock: jest.Mocked<ClickhouseClientMock>;

  beforeEach(() => {
    clientMock = {
      query: jest.fn(),
    };

    service = new StatsService(clientMock);
  });

  const getQuery = (): string => {
    const call = clientMock.query.mock.calls[0];
    return call[0].query;
  };

  // 🟢 базовый сценарий
  it('should build query with date range', async () => {
    clientMock.query.mockReturnValue({
      json: () => Promise.resolve([]),
    });

    await service.getStats({
      from: '2026-05-01',
      to: '2026-05-03',
      groupBy: 'day',
    });

    const query = getQuery();

    expect(query).toContain("event_time >= '2026-05-01'");
    expect(query).toContain("event_time <= '2026-05-03'");
  });

  // 🟡 фильтры
  it('should include eventType and channel filters', async () => {
    clientMock.query.mockReturnValue({
      json: () => Promise.resolve([]),
    });

    await service.getStats({
      from: '2026-05-01',
      to: '2026-05-03',
      groupBy: 'day',
      eventType: 'user.created',
      channel: 'email',
    });

    const query = getQuery();

    expect(query).toContain("event_type = 'user.created'");
    expect(query).toContain("channel = 'email'");
  });

  // 🔵 groupBy hour
  it('should use hourly grouping', async () => {
    clientMock.query.mockReturnValue({
      json: () => Promise.resolve([]),
    });

    await service.getStats({
      from: '2026-05-01',
      to: '2026-05-03',
      groupBy: 'hour',
    });

    const query = getQuery();

    expect(query).toContain('toStartOfHour(event_time)');
  });

  // 🔵 groupBy day
  it('should use daily grouping', async () => {
    clientMock.query.mockReturnValue({
      json: () => Promise.resolve([]),
    });

    await service.getStats({
      from: '2026-05-01',
      to: '2026-05-03',
      groupBy: 'day',
    });

    const query = getQuery();

    expect(query).toContain('toDate(event_time)');
  });

  // 🧮 mapping результата
  it('should map result correctly', async () => {
    const data: StatsItemDto[] = [
      {
        bucket: '2026-05-01',
        total: 10,
        sent: 8,
        failed: 2,
        success_rate: 0.8,
      },
    ];

    clientMock.query.mockReturnValue({
      json: () => Promise.resolve(data),
    });

    const result = await service.getStats({
      from: '2026-05-01',
      to: '2026-05-03',
      groupBy: 'day',
    });

    expect(result).toEqual({
      items: data,
    });
  });
});
