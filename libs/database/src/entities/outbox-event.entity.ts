import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('outbox_events')
export class OutboxEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    type: string;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @Column({ default: false })
    @Index()
    processed: boolean;

    @CreateDateColumn()
    @Index()
    createdAt: Date;
}