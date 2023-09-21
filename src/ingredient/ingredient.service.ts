import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngredientsDto } from './dto/ingredients.dto';
import { EnumPizzaIngredientGroup } from '@prisma/client';

@Injectable()
export class IngredientService {
  constructor(private readonly prisma: PrismaService) {}

  getIngredients(ingredientGroup: EnumPizzaIngredientGroup) {
    return this.prisma.ingredient.findMany({
      where: {
        ingredientGroup,
      },
    });
  }

  async addIngredients({ ingredientGroup, ingredientsName }: IngredientsDto) {
    for (const ingredient of ingredientsName) {
      const foundIngredient = await this.prisma.ingredient.findFirst({
        where: {
          ingredientName: ingredient,
        },
      });
      if (foundIngredient) {
        throw new ConflictException(
          `Ingredient ${foundIngredient.ingredientName} already exists`,
        );
      }
    }

    try {
      await this.prisma.ingredient.createMany({
        data: ingredientsName.map((ingredient) => ({
          ingredientName: ingredient,
          ingredientGroup,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      return error;
    }
  }

  async deleteIngredient(ingredient: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existingIngredient = await prisma.ingredient.findUnique({
        where: {
          ingredientName: ingredient,
        },
      });

      if (!existingIngredient) {
        throw new NotFoundException(
          `Ingredient with name '${ingredient}' not found.`,
        );
      }

      await prisma.ingredient.delete({
        where: {
          ingredientName: ingredient,
        },
      });

      return {
        message: `Ingredient '${ingredient}' was successfully deleted.`,
      };
    });
  }

  async updateIngredient(ingredientName: string, newIngredientName: string) {
    return this.prisma.$transaction(async (prisma) => {
      const ingredientToUpdate = await prisma.ingredient.count({
        where: {
          ingredientName,
        },
      });
      if (!ingredientToUpdate) {
        throw new NotFoundException(
          `Ingredient with name '${ingredientName}' not found.`,
        );
      }
      const updatedIngredient = await prisma.ingredient.update({
        where: {
          ingredientName,
        },
        data: {
          ingredientName: newIngredientName,
        },
      });
      return updatedIngredient;
    });
  }
}
