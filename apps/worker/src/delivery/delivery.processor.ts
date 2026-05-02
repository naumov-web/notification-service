import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Delivery } from '@app/database/entities/delivery.entity';
import { ChannelStrategyFactory } from './channel-strategy.factory';
import {Notification} from "@app/database/entities/notification.entity";
import {OutboxEvent} from "@app/database/entities/outbox-event.entity";

@Injectable()
export class DeliveryProcessor {
    private readonly logger = new Logger(DeliveryProcessor.name);

    constructor(
        @InjectRepository(Delivery)
        private readonly repo: Repository<Delivery>,
        @InjectRepository(Notification)
        private readonly repoNotification: Repository<Notification>,
        private readonly factory: ChannelStrategyFactory,
        private readonly dataSource: DataSource,
    ) {}

    async process(notificationId: string) {
        const [deliveries] = await this.dataSource.query(
            `
                update deliveries 
                set status = $1
                where
                    "notificationId" = $2
                    and status = $3
                returning *;
            `,
            [
                'processing',
                notificationId,
                'pending'
            ]
        );
        const notification = await this.repoNotification.findOne({
            where: { id: notificationId },
        });

        if (!notification) {
            return;
        }

        for (const delivery of deliveries) {
            await this.processOne(notification, delivery);
        }

        await this.updateNotificationStatus(notificationId);
    }

    async processOneById(deliveryId: string) {
        const delivery = await this.repo.findOne({
            where: { id: deliveryId },
        });

        if (!delivery) {
            return;
        }

        if (delivery.status === 'sent') {
            return;
        }

        const notification = await this.repoNotification.findOne({
            where: { id: delivery.notificationId },
        });

        if (!notification) {
            return;
        }

        await this.processOne(notification, delivery);
    }

    private async processOne(notification: Notification, delivery: Delivery) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let status: string = 'sent';

        try {

            const strategy = this.factory.get(delivery.channel);

            await strategy.send({
                target: delivery.target,
                content: delivery.renderedBody,
            });

            delivery.status = 'sent';
            await this.repo.save(delivery);
        } catch (err) {
            this.logger.error(`delivery failed ${delivery.id}`, err);

            delivery.status = 'failed';
            delivery.attempts += 1;

            await this.repo.save(delivery);
            status = 'failed';
        } finally {
            const analyticsEvent = queryRunner.manager.create(OutboxEvent, {
                type: 'analytics.event',
                payload: {
                    eventTime: new Date(),
                    notificationId: delivery.notificationId,
                    deliveryId: delivery.id,
                    userId: notification.userId,
                    eventType: notification.eventType,
                    channel: delivery.channel,
                    status,
                    isRetry: delivery.attempts > 0,
                },
            });

            await queryRunner.manager.save(analyticsEvent);
            await queryRunner.commitTransaction();
            await queryRunner.release();
        }
    }

    private async updateNotificationStatus(notificationId: string) {
        await this.repoNotification.query(
            `update notifications n
             set status = case
                              when not exists (
                                  select 1
                                  from deliveries d
                                  where d."notificationId" = n.id
                                    and d.status != $2
                              ) then $3::notifications_status_enum

                              when exists (
                                  select 1
                                  from deliveries d
                                  where d."notificationId" = n.id
                                    and d.status = $4
                              ) then $5::notifications_status_enum

                              else $6::notifications_status_enum
                 end
             where n.id = $1
            `,
            [
                notificationId,
                'sent',
                'done',
                'failed',
                'failed',
                'processing',
            ],
        );
    }
}