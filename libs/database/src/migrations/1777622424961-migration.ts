import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777622424961 implements MigrationInterface {
    name = 'Migration1777622424961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_143ad83141437d0a365ca32c28"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" DROP COLUMN "processed"`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_events_status_enum" AS ENUM('pending', 'processing', 'processed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "outbox_events" ADD "status" "public"."outbox_events_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "outbox_events" ADD "attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "outbox_events" ADD "nextRetryAt" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_733fafe6b0ec20ec7c93fdbbca" ON "outbox_events" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_908c8b19f4f3aa65937b217d76" ON "outbox_events" ("nextRetryAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_908c8b19f4f3aa65937b217d76"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_733fafe6b0ec20ec7c93fdbbca"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" DROP COLUMN "nextRetryAt"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" DROP COLUMN "attempts"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_events_status_enum"`);
        await queryRunner.query(`ALTER TABLE "outbox_events" ADD "processed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_143ad83141437d0a365ca32c28" ON "outbox_events" ("processed") `);
    }

}
