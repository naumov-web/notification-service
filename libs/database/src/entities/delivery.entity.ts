import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('deliveries')
export class Delivery {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    notificationId: string;

    @Column()
    channel: 'email' | 'sms' | 'push';

    @Column()
    target: string;

    @Column({ default: 'pending' })
    status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

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