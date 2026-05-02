import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFailedStatus1777645582663 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            alter type notifications_status_enum add value if not exists 'failed';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            select 1;
        `);
  }
}
