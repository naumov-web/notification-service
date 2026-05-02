import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777722916270 implements MigrationInterface {
    name = 'Migration1777722916270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          alter type "public"."notifications_status_enum"
          add value if not exists 'failed';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
