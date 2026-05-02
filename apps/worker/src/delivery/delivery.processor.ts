import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';

import { Delivery } from '@app/database/entities/delivery.entity';
import { ChannelStrategyFactory } from './channel-strategy.factory';
import {Notification} from "@app/database/entities/notification.entity";

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

        for (const delivery of deliveries) {
            await this.processOne(delivery);
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

        await this.processOne(delivery);
    }

    private async processOne(delivery: Delivery) {
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