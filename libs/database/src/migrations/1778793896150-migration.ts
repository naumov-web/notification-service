import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778793896150 implements MigrationInterface {
  name = 'Migration1778793896150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "idempotencyKey" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "UQ_bd4c79b47c6a55cce999f3706cb" UNIQUE ("idempotencyKey")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "UQ_bd4c79b47c6a55cce999f3706cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "idempotencyKey"`,
    );
  }
}
