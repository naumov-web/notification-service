import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import {
  Delivery,
  DeliveryStatusEnum,
} from '@app/database/entities/delivery.entity';
import {
  Notification,
  NotificationStatus,
} from '@app/database/entities/notification.entity';
import {
  OutboxEvent,
  OutboxType,
} from '@app/database/entities/outbox-event.entity';
import { MetricsService } from '@app/metrics';
import { ChannelStrategyFactory } from './channel-strategy.factory';

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
    private readonly metrics: MetricsService,
  ) {}

  async process(notificationId: string) {
    const raw = (await this.dataSource.query(
      `
        update deliveries 
        set status = $1
        where
          "notificationId" = $2
          and status = $3
        returning *;
      `,
      [
        NotificationStatus.PROCESSING,
        notificationId,
        NotificationStatus.PENDING,
      ],
    )) as unknown;
    const [deliveries] = raw as [Delivery[], number];
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
    const delivery: Delivery | null = await this.repo.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return;
    }

    if (delivery.status.toString() === DeliveryStatusEnum.SENT.toString()) {
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
    this.metrics.deliveriesTotal.inc({
      channel: delivery.channel,
    });
    if (delivery.attempts > 0) {
      this.metrics.retriesTotal.inc({
        channel: delivery.channel,
      });
    }

    try {
      const strategy = this.factory.get(delivery.channel);

      await strategy.send({
        target: delivery.target,
        content: delivery.renderedBody,
      });

      delivery.status = DeliveryStatusEnum.SENT;
      await this.repo.save(delivery);
      this.metrics.deliveriesSent.inc({
        channel: delivery.channel,
      });
    } catch (err) {
      this.logger.error(`delivery failed ${delivery.id}`, err);

      delivery.status = DeliveryStatusEnum.FAILED;
      delivery.attempts += 1;

      await this.repo.save(delivery);
      status = 'failed';
      this.metrics.deliveriesFailed.inc({
        channel: delivery.channel,
      });
    } finally {
      const analyticsEvent = queryRunner.manager.create(OutboxEvent, {
        type: OutboxType.ANALYTICS_EVENT,
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
      `
          update notifications n
          set status = case
                           when agg.all_sent then $2::notifications_status_enum
                           when agg.all_failed then $3::notifications_status_enum
                           else $4
                       end
          from (
              select d."notificationId",
                     bool_and(d.status = $5)   as all_sent,
                     bool_and(d.status = $6) as all_failed
              from deliveries d
              where d."notificationId" = $1
              group by d."notificationId"
          ) agg
          where n.id = agg."notificationId";
        `,
      [
        notificationId,
        NotificationStatus.DONE,
        NotificationStatus.FAILED,
        NotificationStatus.PROCESSING,
        DeliveryStatusEnum.SENT,
        DeliveryStatusEnum.FAILED,
      ],
    );
  }
}
