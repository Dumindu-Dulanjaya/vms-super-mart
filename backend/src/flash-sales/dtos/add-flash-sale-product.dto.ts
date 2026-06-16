import { IsNumber, Min } from 'class-validator';

export class AddFlashSaleProductDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  @Min(0)
  discountPercentage!: number;

  @IsNumber()
  @Min(0)
  salePrice!: number;
}
