import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewPizzaDto } from './dto/new-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { EnumDoughCrust, EnumPizzaAttributeName } from '@prisma/client';
import { FiltersPizzaDto } from './dto/filters-pizza.dto';

type TUpdatePizza = {
  pizzaName?: string;
  weightStandard?: number;
  priceStandard?: number;
  doughCrust?: EnumDoughCrust;
  ingredients?: { set: { ingredientName: string }[] };
  pizzaAttributes?: { set: { attributeName: EnumPizzaAttributeName }[] };
};

@Injectable()
export class PizzaService {
  constructor(private readonly prisma: PrismaService) {}

  async getPizzas({ ingredientName, pizzaAttributes }: FiltersPizzaDto) {
    try {
      const ingredientNameArray = ingredientName
        ? ingredientName.split(',')
        : undefined;
      const pizzaAttributesArray: EnumPizzaAttributeName[] = pizzaAttributes
        ? pizzaAttributes
            .split(',')
            .map((item) => item as EnumPizzaAttributeName)
        : [];

      const pizzas = await this.prisma.pizza.findMany({
        where: {
          ingredients: {
            some: {
              ingredientName: {
                in: ingredientNameArray,
              },
            },
          },
          pizzaAttributes: {
            some: {
              attributeName: {
                in: pizzaAttributesArray,
              },
            },
          },
        },
        include: {
          ingredients: true,
          pizzaAttributes: true,
        },
      });
      if (!pizzas) {
        throw new NotFoundException('Pizzas not found');
      }
      return pizzas;
    } catch (error) {
      throw error;
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
              attributeName: pizzaAttribute,
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
            attributeName: pizzaAttribute,
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
    pizzaAttributes: EnumPizzaAttributeName[],
    ingredients: string[],
  ) {
    if (pizzaAttributes) {
      for (const attributes of pizzaAttributes) {
        const existingAttributes = await this.prisma.pizzaAttribute.findUnique({
          where: {
            attributeName: attributes,
          },
        });
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
