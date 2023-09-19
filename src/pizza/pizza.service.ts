import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngredientsDto } from './dto/ingredients-dto';

@Injectable()
export class PizzaService {
  constructor(private readonly prisma: PrismaService) {}

  async getPizzas() {
    try {
      const pizzas = await this.prisma.pizza.findMany({
        include: {
          ingredients: true,
          pizzaAttributes: true,
        },
      });
      if (!pizzas) {
        throw new Error('Pizzas not found');
      }
      return pizzas;
    } catch (error) {
      return error;
    }
  }

  async getPizza(id: number) {
    const pizza = await this.prisma.pizza.findFirst({
      where: {
        id,
      },
      include: {
        ingredients: true,
        pizzaAttributes: true,
      },
    });
    if (!pizza) {
      throw new NotFoundException(`Pizza with id ${id} not found`);
    }
    return pizza;
  }

  async addIngredients({ ingredientGroup, ingredientsName }: IngredientsDto) {
    for (const ingredient of ingredientsName) {
      const foundIngredient = await this.prisma.ingredient.findFirst({
        where: {
          ingredientName: ingredient,
        },
      });
      if (foundIngredient) {
        throw new HttpException(
          `Ingredient ${foundIngredient.ingredientName} already exists`,
          409,
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

  // async deleteIngredient(ingredient: string) {
  //   const existingIngredient = await this.prisma.ingredient.count({
  //     where: {
  //       ingredientName: ingredient,
  //     },
  //   });

  //   if (!existingIngredient) {
  //     throw new HttpException(
  //       `Ingredient with name '${ingredient}' not found.`,
  //       409,
  //     );
  //   }

  //   const deleteIngredient = await this.prisma.ingredient.delete({
  //     where: {
  //       ingredientName: ingredient,
  //     },
  //   });
  //   return `Ingredient with name '${deleteIngredient}' was successfully deleted.`;
  // }

  async deleteIngredient(ingredient: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existingIngredient = await prisma.ingredient.findUnique({
        where: {
          ingredientName: ingredient,
        },
      });

      if (!existingIngredient) {
        throw new HttpException(
          `Ingredient with name '${ingredient}' not found.`,
          409,
        );
      }

      await prisma.ingredient.delete({
        where: {
          ingredientName: ingredient,
        },
      });

      return {
        message: `Ingredient with name '${ingredient}' was successfully deleted.`,
      };
    });
  }
}
