import { Inject, Injectable } from '@nestjs/common';
import { EventHandlerStrategy } from './strategies/event-handler.interface';

@Injectable()
export class EventHandlerFactory {
    constructor(
        @Inject('EVENT_HANDLERS')
        private readonly handlers: EventHandlerStrategy[],
    ) {}

    getHandler(eventType: string): EventHandlerStrategy {
        const handler = this.handlers.find((h) => h.supports(eventType));

        if (!handler) {
            throw new Error(`No handler for event: ${eventType}`);
        }

        return handler;
    }
}