import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

// runtime import (ESM-safe)
import * as amqp from 'amqplib';

type ChannelLike = {
  assertExchange: (
    exchange: string,
    type: string,
    options: unknown,
  ) => Promise<unknown>;
  assertQueue: (queue: string, options: unknown) => Promise<unknown>;
  bindQueue: (
    queue: string,
    exchange: string,
    routingKey: string,
  ) => Promise<unknown>;
  prefetch: (count: number) => Promise<unknown>;
  consume: (
    queue: string,
    onMessage: (msg: unknown) => Promise<void>,
    options?: unknown,
  ) => Promise<unknown>;
  ack: (msg: unknown) => void;
  nack: (msg: unknown, allUpTo?: boolean, requeue?: boolean) => void;
  close: () => Promise<void>;
};

type ConnectionLike = {
  createChannel: () => Promise<unknown>;
  close: () => Promise<void>;
};

@Injectable()
export class RabbitMQConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  private connection!: unknown;
  private channel!: unknown;

  async onModuleInit(): Promise<void> {
    const amqpTyped = amqp as unknown as {
      connect: (url: string) => Promise<ConnectionLike>;
    };

    // connection
    this.connection = await amqpTyped.connect(process.env.RABBITMQ_URL!);

    const connection = this.connection as ConnectionLike;

    // channel
    const rawChannel = await connection.createChannel();
    this.channel = rawChannel;

    const channel = this.channel as ChannelLike;

    await channel.assertExchange('events', 'topic', {
      durable: true,
    });

    await channel.assertQueue('notification.events', {
      durable: true,
    });

    await channel.bindQueue('notification.events', 'events', '#');

    await channel.prefetch(10);

    await channel.consume(
      'notification.events',
      async (msgRaw: unknown) => {
        if (!msgRaw) return;

        const msg = msgRaw as {
          content: Buffer;
          fields: { routingKey: string };
        };

        try {
          const payload = JSON.parse(msg.content.toString()) as unknown;

          await this.handleMessage(msg.fields.routingKey, payload);

          channel.ack(msgRaw);
        } catch (err) {
          this.logger.error('consumer error', err as Error);
          channel.nack(msgRaw, false, false);
        }
      },
      { noAck: false },
    );

    this.logger.log('consumer started');
  }

  async onModuleDestroy(): Promise<void> {
    const channel = this.channel as ChannelLike | undefined;
    const connection = this.connection as ConnectionLike | undefined;

    await channel?.close();
    await connection?.close();
  }

  handleMessage(_routingKey: string, _payload: unknown): Promise<void> {
    void _routingKey;
    void _payload;

    return Promise.resolve();
  }
}
