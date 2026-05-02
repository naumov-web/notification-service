import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum TemplateChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column({
    type: 'enum',
    enum: TemplateChannel,
    default: TemplateChannel.EMAIL,
  })
  @Index()
  channel: 'email' | 'sms' | 'push';

  @Column({ nullable: true })
  subject?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb' })
  parametersSchema: Record<string, any>;

  @Column()
  version: number;
}
