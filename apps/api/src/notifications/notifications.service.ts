import {Injectable, NotFoundException} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Notification } from '@app/database/entities/notification.entity';
import { Delivery } from '@app/database/entities/delivery.entity';
import { Template } from '@app/database/entities/template.entity';
import { OutboxEvent } from '@app/database/entities/outbox-event.entity';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly dataSource: DataSource) {}

    async create(dto: CreateNotificationDto) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const notification = queryRunner.manager.create(Notification, {
                userId: dto.userId,
                eventType: dto.eventType,
                parameters: dto.parameters,
                sendAt: dto.sendAt ? new Date(dto.sendAt) : undefined,
            });

            await queryRunner.manager.save(notification);

            const deliveries: Delivery[] = [];

            const entries = [
                { type: 'email', value: dto.channels?.email },
                { type: 'sms', value: dto.channels?.phone },
                { type: 'push', value: dto.channels?.deviceToken },
            ];

            for (const entry of entries) {
                if (!entry.value) {
                    continue;
                }

                const template = await queryRunner.manager.findOne(Template, {
                    where: {
                        eventType: dto.eventType,
                        channel: entry.type as any,
                    },
                    order: { version: 'DESC' },
                });

                if (!template) continue;

                const delivery = queryRunner.manager.create(Delivery, {
                    notificationId: notification.id,
                    channel: entry.type as any,
                    target: entry.value,
                    status: 'pending',
                    attempts: 0,
                    maxRetries: dto.maxRetriesCount ?? 3,
                    templateId: template.id,
                    templateVersion: template.version,
                    renderedBody: this.render(template.body, dto.parameters),
                });

                deliveries.push(delivery);
            }

            if (deliveries.length > 0) {
                await queryRunner.manager.save(deliveries);
            }

            const outboxEvent = queryRunner.manager.create(OutboxEvent, {
                type: 'notification.created',
                payload: {
                    notificationId: notification.id,
                },
            });

            await queryRunner.manager.save(outboxEvent);

            await queryRunner.commitTransaction();

            return notification;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private render(template: string, params: Record<string, any>) {
        return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
            return params?.[key] ?? '';
        });
    }

    async retry(notificationId: string) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const deliveries = await queryRunner.manager.find(Delivery, {
                where: {
                    notificationId,
                    status: 'failed',
                },
            });

            if (!deliveries.length) {
                throw new NotFoundException('No failed deliveries for this notification');
            }

            for (const delivery of deliveries) {
                const event = queryRunner.manager.create(OutboxEvent, {
                    type: 'delivery.retry',
                    payload: {
                        deliveryId: delivery.id,
                    },
                });

                await queryRunner.manager.save(event);
            }

            await queryRunner.commitTransaction();

            return { retried: deliveries.length };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}