import { Module } from '@nestjs/common';

import { EventsConsumer } from './events.consumer';
import { EventHandlerFactory } from './event-handler.factory';
import { NotificationCreatedHandler } from './strategies/notification-created.handler';
import {DeliveryModule} from "../delivery/delivery.module";

@Module({
    imports: [DeliveryModule],
    providers: [
        EventsConsumer,
        EventHandlerFactory,
        NotificationCreatedHandler,
        {
            provide: 'EVENT_HANDLERS',
            useFactory: (
                notificationCreated: NotificationCreatedHandler,
            ) => [notificationCreated],
            inject: [NotificationCreatedHandler],
        },
    ],
    exports: ['EVENT_HANDLERS'],
})
export class EventsModule {}