import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventoryColumns1777460491755 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`stock\` int NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`lowStockThreshold\` int NOT NULL DEFAULT 5`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`lowStockThreshold\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`stock\``);
    }

}
