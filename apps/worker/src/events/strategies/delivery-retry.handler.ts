import { Injectable } from '@nestjs/common';
import { EventHandlerStrategy } from './event-handler.interface';
import { DeliveryProcessor } from '../../delivery/delivery.processor';

@Injectable()
export class DeliveryRetryHandler implements EventHandlerStrategy {
  constructor(private readonly delivery: DeliveryProcessor) {}

  supports(eventType: string): boolean {
    return eventType === 'delivery.retry';
  }

  async handle(payload: any): Promise<void> {
    await this.delivery.processOneById(payload.notificationId);
  }
}
