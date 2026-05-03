import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777840934348 implements MigrationInterface {
  name = 'Migration1777840934348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."delivery_status_enum" AS ENUM('pending', 'processing', 'sent', 'failed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "status" "public"."delivery_status_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."delivery_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "status" character varying NOT NULL DEFAULT 'pending'`,
    );
  }
}
