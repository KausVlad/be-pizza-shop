import { IsOptional, IsString } from 'class-validator';

export class FiltersPizzaDto {
  @IsOptional()
  @IsString()
  ingredientName?: string;

  @IsOptional()
  @IsString()
  pizzaAttributes?: string;
}
