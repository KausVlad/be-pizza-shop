import { EnumPizzaIngredientGroup } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class IngredientsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredientsName: string[];

  @IsEnum(EnumPizzaIngredientGroup)
  ingredientGroup: EnumPizzaIngredientGroup;
}
