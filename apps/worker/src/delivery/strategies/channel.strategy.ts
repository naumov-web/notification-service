export interface ChannelStrategy {
    supports(channel: string): boolean;

    send(input: {
        target: string;
        content: string;
    }): Promise<void>;
}