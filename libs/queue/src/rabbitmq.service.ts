import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { QueueMessagePayload } from '@app/queue/types/queue-message-payload.dto';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: Connection;
  private channel!: Channel;

  async onModuleInit() {
    this.connection = await connect(process.env.RABBITMQ_URL!);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('events', 'topic', {
      durable: true,
    });
  }

  async publish(routingKey: string, payload: QueueMessagePayload) {
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
