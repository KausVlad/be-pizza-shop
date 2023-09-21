import { EnumDoughCrust } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePizzaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pizzaName?: string;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  weightStandard?: number;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  priceStandard?: number;

  @IsOptional()
  @IsEnum(EnumDoughCrust)
  doughCrust?: EnumDoughCrust;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  pizzaAttributes?: string[];
}
