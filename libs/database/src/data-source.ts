import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { Delivery } from './entities/delivery.entity';
import { Template } from './entities/template.entity';
import { OutboxEvent } from './entities/outbox-event.entity';
import { AdminUser } from "./entities/admin-user.entity";

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Notification, Delivery, Template, OutboxEvent, AdminUser],
    migrations: ['libs/database/src/migrations/*.ts'],
    synchronize: false,
});