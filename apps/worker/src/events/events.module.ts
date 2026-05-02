import { Module } from '@nestjs/common';

import { EventsConsumer } from './events.consumer';
import { EventHandlerFactory } from './event-handler.factory';
import { NotificationCreatedHandler } from './strategies/notification-created.handler';
import { DeliveryModule } from "../delivery/delivery.module";
import { DeliveryRetryHandler } from "./strategies/delivery-retry.handler";
import { AnalyticsEventHandler } from "./strategies/analytics-event.handler";
import { AnalyticsModule } from '@app/analytics';

@Module({
    imports: [DeliveryModule, AnalyticsModule],
    providers: [
        EventsConsumer,
        EventHandlerFactory,
        NotificationCreatedHandler,
        DeliveryRetryHandler,
        AnalyticsEventHandler,
        {
            provide: 'EVENT_HANDLERS',
            useFactory: (
                notificationCreated: NotificationCreatedHandler,
                deliveryRetry: DeliveryRetryHandler,
                analyticsEvent: AnalyticsEventHandler,
            ) => [
                notificationCreated,
                deliveryRetry,
                analyticsEvent,
            ],
            inject: [
                NotificationCreatedHandler,
                DeliveryRetryHandler,
                AnalyticsEventHandler
            ],
        },
    ],
    exports: ['EVENT_HANDLERS'],
})
export class EventsModule {}