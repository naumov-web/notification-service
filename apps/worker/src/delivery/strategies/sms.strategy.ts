import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';

@Injectable()
export class SmsStrategy implements ChannelStrategy {
    private readonly logger = new Logger(SmsStrategy.name);

    supports(channel: string): boolean {
        return channel === 'sms';
    }

    async send(input: { target: string; content: string }): Promise<void> {
        this.logger.log(`sending sms to ${input.target}`);

        await new Promise((r) => setTimeout(r, 300));

        this.logger.log(`sms sent: ${input.content}`);
    }
}