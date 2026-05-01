import { Injectable } from '@nestjs/common';
import { RabbitMQConsumer } from '@app/queue/rabbitmq.consumer';
import { EventHandlerFactory } from './event-handler.factory';

@Injectable()
export class EventsConsumer extends RabbitMQConsumer {
    constructor(private readonly factory: EventHandlerFactory) {
        super();
        console.log('🚀 EventsConsumer created');
    }

    async handleMessage(routingKey: string, payload: any) {
        console.log('routing key', routingKey);
        const handler = this.factory.getHandler(routingKey);
        await handler.handle(payload);
    }
}