import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationsIndexes1777722760000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      create index idx_notifications_user_id
      on notifications ("userId");
    `);

        await queryRunner.query(`
      create index idx_notifications_event_type
      on notifications ("eventType");
    `);

        await queryRunner.query(`
      create index idx_notifications_status
      on notifications (status);
    `);

        await queryRunner.query(`
      create index idx_notifications_created_at
      on notifications ("createdAt");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop index idx_notifications_user_id`);
        await queryRunner.query(`drop index idx_notifications_event_type`);
        await queryRunner.query(`drop index idx_notifications_status`);
        await queryRunner.query(`drop index idx_notifications_created_at`);
    }
}