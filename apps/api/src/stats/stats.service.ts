import { Injectable, Inject } from '@nestjs/common';
import { CLICKHOUSE_CLIENT } from '@app/analytics';

@Injectable()
export class StatsService {
    constructor(
        @Inject(CLICKHOUSE_CLIENT)
        private readonly client: any,
    ) {}

    async getStats(params: {
        from: string;
        to: string;
        groupBy: 'day' | 'hour';
        eventType?: string;
        channel?: string;
    }) {
        const { from, to, groupBy, eventType, channel } = params;

        const groupExpr =
            groupBy === 'hour'
                ? 'toStartOfHour(event_time)'
                : 'toDate(event_time)';

        const conditions: string[] = [
            `event_time >= '${from}'`,
            `event_time <= '${to}'`,
        ];

        if (eventType) {
            conditions.push(`event_type = '${eventType}'`);
        }

        if (channel) {
            conditions.push(`channel = '${channel}'`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
      SELECT
        ${groupExpr} AS bucket,
        count() AS total,
        countIf(status = 'sent') AS sent,
        countIf(status = 'failed') AS failed,
        round(countIf(status = 'sent') / count(), 4) AS success_rate
      FROM analytics_events
      ${where}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

        const result = await this.client.query({
            query,
            format: 'JSONEachRow',
        });

        const data = await result.json();

        return data;
    }
}