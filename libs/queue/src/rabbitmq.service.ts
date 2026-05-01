import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    async onModuleInit() {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL!);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange('events', 'topic', {
            durable: true,
        });
    }

    async publish(routingKey: string, payload: any) {
        const buffer = Buffer.from(JSON.stringify(payload));

        this.channel.publish('events', routingKey, buffer, {
            persistent: true,
        });
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }
}