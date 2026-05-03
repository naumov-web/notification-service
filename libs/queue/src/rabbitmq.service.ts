import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { QueueMessagePayload } from '@app/queue/types/queue-message-payload.dto';

type ChannelLike = {
  assertExchange: (
    exchange: string,
    type: string,
    options: unknown,
  ) => Promise<unknown>;
  publish: (
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: unknown,
  ) => boolean;
  close: () => Promise<void>;
};

type ConnectionLike = {
  createChannel: () => Promise<unknown>;
  close: () => Promise<void>;
};

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: unknown;
  private channel!: unknown;
  private exchangeName: string = 'events';
  private exchangeType: string = 'topic';

  async onModuleInit(): Promise<void> {
    const amqpTyped = amqp as unknown as {
      connect: (url: string) => Promise<ConnectionLike>;
    };
    this.connection = await amqpTyped.connect(process.env.RABBITMQ_URL!);
    const connection = this.connection as ConnectionLike;
    const rawChannel = await connection.createChannel();
    this.channel = rawChannel;
    const channel = this.channel as ChannelLike;

    await channel.assertExchange(this.exchangeName, this.exchangeType, {
      durable: true,
    });
  }

  async publish(
    routingKey: string,
    payload: QueueMessagePayload,
  ): Promise<void> {
    const channel = this.channel as ChannelLike;
    const buffer = Buffer.from(JSON.stringify(payload));
    channel.publish(this.exchangeName, routingKey, buffer, {
      persistent: true,
    });

    await Promise.resolve();
  }

  async onModuleDestroy(): Promise<void> {
    const channel = this.channel as ChannelLike | undefined;
    const connection = this.connection as ConnectionLike | undefined;

    await channel?.close();
    await connection?.close();
  }
}
