import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductImages1777470000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'images',
        type: 'json',
        isNullable: true,
        default: '[]',
        comment: 'Array of high-resolution product images (4-5 images per product)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'images');
  }
}
