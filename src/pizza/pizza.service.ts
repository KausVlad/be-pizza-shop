import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngredientDto } from './dto/ingredient-dto';

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

  async addIngredients({ ingredientGroup, ingredientsName }: IngredientDto) {
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
}
