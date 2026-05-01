import { Injectable } from '@nestjs/common';
import { RabbitMQConsumer } from '@app/queue/rabbitmq.consumer';
import { EventHandlerFactory } from './event-handler.factory';

@Injectable()
export class EventsConsumer extends RabbitMQConsumer {
    constructor(private readonly factory: EventHandlerFactory) {
        super();
    }

    async handleMessage(routingKey: string, payload: any) {
        const handler = this.factory.getHandler(routingKey);
        await handler.handle(payload);
    }
}