import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy } from './channel.strategy';

@Injectable()
export class PushStrategy implements ChannelStrategy {
    private readonly logger = new Logger(PushStrategy.name);

    supports(channel: string): boolean {
        return channel === 'push';
    }

    async send(input: { target: string; content: string }): Promise<void> {
        this.logger.log(`sending push to ${input.target}`);

        await new Promise((r) => setTimeout(r, 200));

        this.logger.log(`push sent: ${input.content}`);
    }
}