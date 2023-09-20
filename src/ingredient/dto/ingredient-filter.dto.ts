import { EnumPizzaIngredientGroup } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class IngredientFilterDto {
  @IsOptional()
  @IsEnum(EnumPizzaIngredientGroup)
  ingredientGroup: EnumPizzaIngredientGroup;
}
