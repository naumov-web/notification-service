import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';
import { DeliveryChannel } from '@app/database/entities/delivery.entity';

@Injectable()
export class SmsStrategy implements ChannelStrategy {
  private readonly logger = new Logger(SmsStrategy.name);

  supports(channel: string): boolean {
    return channel === DeliveryChannel.SMS.toString();
  }

  async send(input: { target: string; content: string }): Promise<void> {
    this.logger.log(`sending sms to ${input.target}`);
    await new Promise((r) => setTimeout(r, 300));
    this.logger.log(`sms sent: ${input.content}`);
  }
}
