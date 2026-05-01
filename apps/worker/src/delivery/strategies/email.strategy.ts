import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';

@Injectable()
export class EmailStrategy implements ChannelStrategy {
    private readonly logger = new Logger(EmailStrategy.name);

    supports(channel: string): boolean {
        return channel === 'email';
    }

    async send(input: { target: string; content: string }): Promise<void> {
        this.logger.log(`sending email to ${input.target}`);
        await new Promise((r) => setTimeout(r, 10000));

        this.logger.log(`email sent: ${input.content}`);
    }
}