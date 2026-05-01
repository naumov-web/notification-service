import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ChannelStrategyFactory} from "../../../worker/src/delivery/channel-strategy.factory";
import {DeliveryProcessor} from "../../../worker/src/delivery/delivery.processor";
import {Delivery} from "@app/database/entities/delivery.entity";
import {Notification} from "@app/database/entities/notification.entity";
import {EmailStrategy} from "../../../worker/src/delivery/strategies/email.strategy";
import {SmsStrategy} from "../../../worker/src/delivery/strategies/sms.strategy";
import {PushStrategy} from "../../../worker/src/delivery/strategies/push.strategy";
import { DeliveryCron } from "./delivery.cron";
import { DeliveryRetryProcessor } from "./delivery-retry.processor";

@Module({
    imports: [
        TypeOrmModule.forFeature([Delivery, Notification]),
    ],
    providers: [
        DeliveryCron,
        DeliveryRetryProcessor,
        DeliveryProcessor,
        ChannelStrategyFactory,
        EmailStrategy,
        SmsStrategy,
        PushStrategy,
        {
            provide: 'CHANNEL_STRATEGIES',
            useFactory: (
                email: EmailStrategy,
                sms: SmsStrategy,
                push: PushStrategy,
            ) => [email, sms, push],
            inject: [EmailStrategy, SmsStrategy, PushStrategy],
        },
    ],
    exports: [
        DeliveryProcessor,
        ChannelStrategyFactory,
    ],
})
export class DeliveryModule {}