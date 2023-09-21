import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewPizzaDto } from './dto/new-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { EnumDoughCrust } from '@prisma/client';

type TUpdatePizza = {
  pizzaName?: string;
  weightStandard?: number;
  priceStandard?: number;
  doughCrust?: EnumDoughCrust;
  ingredients?: { set: { ingredientName: string }[] };
  pizzaAttributes?: { set: { attributes: string }[] };
};

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
    ingredients,
    pizzaAttributes,
  }: NewPizzaDto) {
    return this.prisma.$transaction(async () => {
      const uniquePizzaCheck = await this.prisma.pizza.count({
        where: {
          pizzaName,
        },
      });

      if (uniquePizzaCheck) {
        throw new ConflictException(`Pizza '${pizzaName}' already exists`);
      }

      await this.existingAttributesAndIngredients(pizzaAttributes, ingredients);

      return await this.prisma.pizza.create({
        data: {
          pizzaName,
          weightStandard,
          priceStandard,
          doughCrust,
          ingredients: {
            connect: ingredients.map((ingredientName) => ({
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

  async deletePizza(id: number) {
    return this.prisma.$transaction(async () => {
      const existingPizza = await this.prisma.pizza.count({
        where: {
          id,
        },
      });

      if (!existingPizza) {
        throw new NotFoundException(`Pizza with id ${id} not found`);
      }

      const deletedPizza = await this.prisma.pizza.delete({
        where: {
          id,
        },
      });

      return {
        message: `Pizza ${deletedPizza.pizzaName} was successfully deleted`,
      };
    });
  }

  async updatePizza(
    id: number,
    { pizzaAttributes, ingredients, ...data }: UpdatePizzaDto,
  ) {
    return this.prisma.$transaction(async () => {
      const pizzaToUpdate = await this.prisma.pizza.count({
        where: {
          id,
        },
      });

      if (!pizzaToUpdate) {
        throw new NotFoundException(`Pizza with id ${id} not found`);
      }

      await this.existingAttributesAndIngredients(pizzaAttributes, ingredients);

      const updateData: TUpdatePizza = {
        ...data,
      };

      if (ingredients) {
        updateData.ingredients = {
          set: ingredients.map((ingredientName) => ({
            ingredientName,
          })),
        };
      }

      if (pizzaAttributes) {
        updateData.pizzaAttributes = {
          set: pizzaAttributes.map((pizzaAttribute) => ({
            attributes: pizzaAttribute,
          })),
        };
      }

      return await this.prisma.pizza.update({
        where: {
          id,
        },
        data: updateData,
      });
    });
  }

  private async existingAttributesAndIngredients(
    pizzaAttributes: string[],
    ingredients: string[],
  ) {
    if (pizzaAttributes) {
      for (const attributes of pizzaAttributes) {
        const existingAttributes = await this.prisma.pizzaAttributes.findUnique(
          {
            where: {
              attributes: attributes,
            },
          },
        );
        if (!existingAttributes) {
          throw new NotFoundException(
            `Attribute with name '${attributes}' not found.`,
          );
        }
      }
    }

    if (ingredients) {
      for (const ingredient of ingredients) {
        const existingIngredient = await this.prisma.ingredient.findUnique({
          where: {
            ingredientName: ingredient,
          },
        });
        if (!existingIngredient) {
          throw new NotFoundException(
            `Ingredient with name '${ingredient}' not found.`,
          );
        }
      }
    }
  }
}
