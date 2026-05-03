import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';
import { DeliveryChannel } from '@app/database/entities/delivery.entity';

@Injectable()
export class PushStrategy implements ChannelStrategy {
  private readonly logger = new Logger(PushStrategy.name);

  supports(channel: string): boolean {
    return channel === DeliveryChannel.PUSH.toString();
  }

  async send(input: { target: string; content: string }): Promise<void> {
    this.logger.log(`sending push to ${input.target}`);
    await new Promise((r) => setTimeout(r, 5000));
    this.logger.log(`push sent: ${input.content}`);
  }
}
