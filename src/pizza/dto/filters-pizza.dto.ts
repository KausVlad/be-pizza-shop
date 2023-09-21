import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EnumPizzaSortOrder } from '../enum/pizza-sort-order.enum';

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

  @IsOptional()
  @IsEnum(EnumPizzaSortOrder)
  pizzaSortOrder?: EnumPizzaSortOrder;
}
