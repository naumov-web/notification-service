import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  @Index()
  eventType: string;

  @Column({ type: 'jsonb' })
  parameters: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  sendAt?: Date;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @Index()
  status: NotificationStatus;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({
    nullable: true,
    unique: true,
  })
  idempotencyKey?: string;
}
