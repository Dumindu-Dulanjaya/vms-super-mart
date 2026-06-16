import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';

export class CreateFlashSaleDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsEnum(['active', 'scheduled', 'expired'])
  status?: 'active' | 'scheduled' | 'expired';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
