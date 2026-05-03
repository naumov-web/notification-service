import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777841789873 implements MigrationInterface {
  name = 'Migration1777841789873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN "channel"`);
    await queryRunner.query(
      `CREATE TYPE "public"."delivery_channel_enum" AS ENUM('email', 'sms', 'push')`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "channel" "public"."delivery_channel_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN "channel"`);
    await queryRunner.query(`DROP TYPE "public"."delivery_channel_enum"`);
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "channel" character varying NOT NULL`,
    );
  }
}
