import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777617786266 implements MigrationInterface {
  name = 'Migration1777617786266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_status_enum" AS ENUM('pending', 'processing', 'done', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "eventType" character varying NOT NULL, "parameters" jsonb NOT NULL, "sendAt" TIMESTAMP, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_838f697dc4d0c503eff8e8910a" ON "notifications" ("eventType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92f5d3a7779be163cbea7916c6" ON "notifications" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_831a5a06f879fb0bebf8965871" ON "notifications" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notificationId" uuid NOT NULL, "channel" character varying NOT NULL, "target" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "attempts" integer NOT NULL DEFAULT '0', "maxRetries" integer NOT NULL DEFAULT '3', "nextRetryAt" TIMESTAMP, "error" text, "templateId" character varying NOT NULL, "templateVersion" integer NOT NULL, "renderedBody" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."templates_channel_enum" AS ENUM('email', 'sms', 'push')`,
    );
    await queryRunner.query(
      `CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventType" character varying NOT NULL, "channel" "public"."templates_channel_enum" NOT NULL DEFAULT 'email', "subject" character varying, "body" text NOT NULL, "parametersSchema" jsonb NOT NULL, "version" integer NOT NULL, CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2db126bc743f1c9159fb63404e" ON "templates" ("channel") `,
    );
    await queryRunner.query(
      `CREATE TABLE "outbox_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "payload" jsonb NOT NULL, "processed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6689a16c00d09b8089f6237f1d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0b7668aa1aed034a544a7ad043" ON "outbox_events" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_143ad83141437d0a365ca32c28" ON "outbox_events" ("processed") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_041d72983f975459cb9011d584" ON "outbox_events" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_041d72983f975459cb9011d584"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_143ad83141437d0a365ca32c28"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b7668aa1aed034a544a7ad043"`,
    );
    await queryRunner.query(`DROP TABLE "outbox_events"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2db126bc743f1c9159fb63404e"`,
    );
    await queryRunner.query(`DROP TABLE "templates"`);
    await queryRunner.query(`DROP TYPE "public"."templates_channel_enum"`);
    await queryRunner.query(`DROP TABLE "deliveries"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_831a5a06f879fb0bebf8965871"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92f5d3a7779be163cbea7916c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_838f697dc4d0c503eff8e8910a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
  }
}
