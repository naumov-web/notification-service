import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Delivery } from '@app/database/entities/delivery.entity';
import { Notification } from '@app/database/entities/notification.entity';

import { DeliveryProcessor } from './delivery.processor';
import { ChannelStrategyFactory } from './channel-strategy.factory';

import { EmailStrategy } from './strategies/email.strategy';
import { SmsStrategy } from './strategies/sms.strategy';
import { PushStrategy } from './strategies/push.strategy';

@Module({
    imports: [TypeOrmModule.forFeature([Delivery, Notification])],
    providers: [
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
    exports: [DeliveryProcessor],
})
export class DeliveryModule {}