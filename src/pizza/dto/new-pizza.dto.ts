import { EnumDoughCrust } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class NewPizzaDto {
  @IsString()
  @IsNotEmpty()
  pizzaName: string;

  @IsInt()
  @IsNotEmpty()
  weightStandard: number;

  @IsInt()
  @IsNotEmpty()
  priceStandard: number;

  @IsEnum(EnumDoughCrust)
  doughCrust: EnumDoughCrust;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  pizzaAttributes: string[];
}
