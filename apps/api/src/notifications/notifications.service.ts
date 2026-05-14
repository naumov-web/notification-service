import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  Notification,
  NotificationStatus,
} from '@app/database/entities/notification.entity';
import {
  Delivery,
  DeliveryChannel,
  DeliveryStatusEnum,
} from '@app/database/entities/delivery.entity';
import {
  Template,
  TemplateChannel,
} from '@app/database/entities/template.entity';
import {
  OutboxEvent,
  OutboxType,
} from '@app/database/entities/outbox-event.entity';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    dto: CreateNotificationDto,
    idempotencyKey: string,
  ): Promise<Notification> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const existing: Notification | null =
      await queryRunner.manager.findOne<Notification>(Notification, {
        where: {
          idempotencyKey,
        },
      });

    if (existing) {
      return existing;
    }

    await queryRunner.startTransaction();

    try {
      const notification = queryRunner.manager.create(Notification, {
        userId: dto.userId,
        eventType: dto.eventType,
        parameters: dto.parameters,
        sendAt: dto.sendAt ? new Date(dto.sendAt) : undefined,
        idempotencyKey,
      });

      await queryRunner.manager.save(notification);

      const deliveries: Delivery[] = [];

      const entries: { type: DeliveryChannel; value?: string }[] = [
        { type: DeliveryChannel.EMAIL, value: dto.channels?.email },
        { type: DeliveryChannel.SMS, value: dto.channels?.sms },
        { type: DeliveryChannel.PUSH, value: dto.channels?.push },
      ];

      for (const entry of entries) {
        if (!entry.value) {
          continue;
        }

        const template = await queryRunner.manager.findOne(Template, {
          where: {
            eventType: dto.eventType,
            channel: entry.type as unknown as TemplateChannel,
          },
          order: { version: 'DESC' },
        });

        if (!template) {
          continue;
        }

        const delivery: Delivery = queryRunner.manager.create(Delivery, {
          notificationId: notification.id,
          channel: entry.type,
          target: entry.value,
          status: DeliveryStatusEnum.PENDING,
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
        type: OutboxType.NOTIFICATION_CREATED,
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

  private render(template: string, params: Record<string, unknown>) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => {
      const value = params?.[key];

      return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : '';
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
          status: DeliveryStatusEnum.FAILED,
        },
      });

      if (!deliveries.length) {
        throw new NotFoundException(
          'No failed deliveries for this notification',
        );
      }

      for (const delivery of deliveries) {
        const event = queryRunner.manager.create(OutboxEvent, {
          type: OutboxType.DELIVERY_RETRY,
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

  async cancel(notificationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const notification = await queryRunner.manager.findOne(Notification, {
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await queryRunner.manager.update(
        Notification,
        { id: notificationId },
        { status: NotificationStatus.CANCELLED },
      );

      await queryRunner.manager.query(
        `
                  update deliveries
                  set status = $1
                  where "notificationId" = $2
                    and status in ($3, $4)
                  `,
        [
          DeliveryStatusEnum.CANCELLED,
          notificationId,
          DeliveryStatusEnum.PENDING,
          DeliveryStatusEnum.FAILED,
        ],
      );

      await queryRunner.commitTransaction();

      return { cancelled: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
