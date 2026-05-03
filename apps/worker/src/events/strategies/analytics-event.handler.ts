import { Injectable, Inject } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { CLICKHOUSE_CLIENT } from 'libs/analytics/src';
import { EventHandlerStrategy } from './event-handler.interface';
import { DeliveryChannel } from '@app/database/entities/delivery.entity';
import { OutboxType } from '@app/database/entities/outbox-event.entity';

type AnalyticsEvent = {
  eventTime: string | Date;
  notificationId: string;
  deliveryId: string;
  userId: string;
  eventType: string;
  channel: DeliveryChannel;
  status: 'sent' | 'failed';
  isRetry: boolean;
};

@Injectable()
export class AnalyticsEventHandler implements EventHandlerStrategy {
  constructor(
    @Inject(CLICKHOUSE_CLIENT)
    private readonly client: ClickHouseClient,
  ) {}

  supports(eventType: string): boolean {
    return eventType === OutboxType.ANALYTICS_EVENT.toString();
  }

  async handle(payload: AnalyticsEvent) {
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

    return d.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
  }
}
