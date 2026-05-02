import { Injectable } from '@nestjs/common';
import { EventHandlerStrategy } from './event-handler.interface';
import { DeliveryProcessor } from '../../delivery/delivery.processor';

@Injectable()
export class NotificationCreatedHandler implements EventHandlerStrategy {
  constructor(private readonly delivery: DeliveryProcessor) {}

  supports(eventType: string): boolean {
    return eventType === 'notification.created';
  }

  async handle(payload: any): Promise<void> {
    await this.delivery.process(payload.notificationId);
  }
}
