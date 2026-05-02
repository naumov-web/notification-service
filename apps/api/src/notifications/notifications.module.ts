import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '@app/database/entities/notification.entity';
import { Delivery } from '@app/database/entities/delivery.entity';
import { Template } from '@app/database/entities/template.entity';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { OutboxEvent } from "@app/database/entities/outbox-event.entity";
import {QueryModule} from "@app/query";

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, Delivery, Template, OutboxEvent]),
        QueryModule,
    ],
    providers: [NotificationsService],
    controllers: [NotificationsController],
})
export class NotificationsModule {}