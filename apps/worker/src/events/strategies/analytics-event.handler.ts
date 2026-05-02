import { Injectable, Inject } from '@nestjs/common';
import { CLICKHOUSE_CLIENT } from 'libs/analytics/src';
import { EventHandlerStrategy } from './event-handler.interface';

@Injectable()
export class AnalyticsEventHandler implements EventHandlerStrategy {
  constructor(
    @Inject(CLICKHOUSE_CLIENT)
    private readonly client: any,
  ) {}

  supports(eventType: string): boolean {
    return eventType === 'analytics.event';
  }

  async handle(payload: any) {
    await this.client.insert({
      table: 'analytics_events',
      values: [
        {
          event_time: this.formatDate(payload.eventTime),
          notification_id: payload.notificationId,
          delivery_id: payload.deliveryId,
          user_id: payload.userId,
          event_type: payload.eventType,
          channel: payload.channel,
          status: payload.status,
          is_retry: payload.isRetry ? 1 : 0,
        },
      ],
      format: 'JSONEachRow',
    });
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);

    return d.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]; // убираем миллисекунды
  }
}
