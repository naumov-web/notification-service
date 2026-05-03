import { Inject, Injectable } from '@nestjs/common';
import { ChannelStrategy } from './strategies/channel.strategy';

@Injectable()
export class ChannelStrategyFactory {
  constructor(
    @Inject('CHANNEL_STRATEGIES')
    private readonly strategies: ChannelStrategy[],
  ) {}

  get(channel: string): ChannelStrategy {
    const strategy = this.strategies.find((s) => s.supports(channel));

    if (!strategy) {
      throw new Error(`No strategy for channel: ${channel}`);
    }

    return strategy;
  }
}
