import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Delivery } from '@app/database/entities/delivery.entity';
import { ChannelStrategyFactory } from './channel-strategy.factory';

@Injectable()
export class DeliveryProcessor {
    private readonly logger = new Logger(DeliveryProcessor.name);

    constructor(
        @InjectRepository(Delivery)
        private readonly repo: Repository<Delivery>,
        private readonly factory: ChannelStrategyFactory,
    ) {}

    async process(notificationId: string) {
        const deliveries = await this.repo.find({
            where: { notificationId, status: 'pending' },
        });

        for (const delivery of deliveries) {
            await this.processOne(delivery);
        }
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
}