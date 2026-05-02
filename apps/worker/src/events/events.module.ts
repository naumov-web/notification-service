import { Module } from '@nestjs/common';

import { EventsConsumer } from './events.consumer';
import { EventHandlerFactory } from './event-handler.factory';
import { NotificationCreatedHandler } from './strategies/notification-created.handler';
import {DeliveryModule} from "../delivery/delivery.module";
import {DeliveryRetryHandler} from "./strategies/delivery-retry.handler";

@Module({
    imports: [DeliveryModule],
    providers: [
        EventsConsumer,
        EventHandlerFactory,
        NotificationCreatedHandler,
        DeliveryRetryHandler,
        {
            provide: 'EVENT_HANDLERS',
            useFactory: (
                notificationCreated: NotificationCreatedHandler,
                deliveryRetry: DeliveryRetryHandler,
            ) => [
                notificationCreated,
                deliveryRetry,
            ],
            inject: [
                NotificationCreatedHandler,
                DeliveryRetryHandler,
            ],
        },
    ],
    exports: ['EVENT_HANDLERS'],
})
export class EventsModule {}