import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FiltersPizzaDto {
  @IsOptional()
  @IsString()
  ingredientName?: string;

  @IsOptional()
  @IsString()
  pizzaAttributes?: string;

  @IsOptional()
  @IsInt()
  @Max(10000)
  @Min(1)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Max(10000)
  @Min(1)
  maxPrice?: number;
}
