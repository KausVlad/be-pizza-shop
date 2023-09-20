import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewPizzaDto } from './dto/new-pizza.dto';

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

  async addPizza({
    pizzaName,
    doughCrust,
    weightStandard,
    priceStandard,
    ingredientsName,
    pizzaAttributes,
  }: NewPizzaDto) {
    return this.prisma.$transaction(async (prisma) => {
      const uniquePizzaCheck = await prisma.pizza.count({
        where: {
          pizzaName,
        },
      });

      if (uniquePizzaCheck) {
        throw new HttpException(`Pizza '${pizzaName}' already exists`, 409);
      }

      for (const attributes of pizzaAttributes) {
        const existingAttributes = await this.prisma.pizzaAttributes.findUnique(
          {
            where: {
              attributes: attributes,
            },
          },
        );
        if (!existingAttributes) {
          throw new HttpException(
            `Attribute with name '${attributes}' not found.`,
            409,
          );
        }
      }

      for (const ingredient of ingredientsName) {
        const existingIngredient = await this.prisma.ingredient.findUnique({
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
      }

      return await prisma.pizza.create({
        data: {
          pizzaName,
          weightStandard,
          priceStandard,
          doughCrust,
          ingredients: {
            connect: ingredientsName.map((ingredientName) => ({
              ingredientName,
            })),
          },
          pizzaAttributes: {
            connect: pizzaAttributes.map((pizzaAttribute) => ({
              attributes: pizzaAttribute,
            })),
          },
        },
      });
    });
  }
}
