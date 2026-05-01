import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQConsumer.name);

    private connection: amqp.Connection;
    private channel: amqp.Channel;

    async onModuleInit() {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL!);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange('events', 'topic', {
            durable: true,
        });

        await this.channel.assertQueue('notification.events', {
            durable: true,
        });

        await this.channel.bindQueue(
            'notification.events',
            'events',
            '#',
        );

        await this.channel.prefetch(10);

        await this.channel.consume(
            'notification.events',
            async (msg) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());

                    await this.handleMessage(msg.fields.routingKey, content);

                    this.channel.ack(msg);
                } catch (err) {
                    this.logger.error('consumer error', err);

                    this.channel.nack(msg, false, false);
                }
            },
            { noAck: false },
        );

        this.logger.log('consumer started');
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    async handleMessage(routingKey: string, payload: any) {

    }
}