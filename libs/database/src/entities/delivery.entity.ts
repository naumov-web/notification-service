import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum DeliveryStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DeliveryChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  notificationId: string;

  @Column({
    type: 'enum',
    enum: DeliveryChannel,
    enumName: 'delivery_channel_enum',
  })
  channel: DeliveryChannel;

  @Column()
  target: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatusEnum,
    enumName: 'delivery_status_enum',
    default: DeliveryStatusEnum.PENDING,
  })
  status: DeliveryStatusEnum;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column()
  templateId: string;

  @Column()
  templateVersion: number;

  @Column({ type: 'text', nullable: true })
  renderedBody?: string;

  @CreateDateColumn()
  createdAt: Date;
}
