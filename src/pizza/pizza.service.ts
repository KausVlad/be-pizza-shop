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
import { PizzaIdDto } from './dto/pizza-id.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

  async getPizzas({
    ingredientName,
    pizzaAttributes,
    maxPrice,
    minPrice,
    pizzaSortOrder,
  }: FiltersPizzaDto) {
    try {
      const ingredientNameArray = ingredientName
        ? ingredientName.split(',')
        : undefined;
      const pizzaAttributesArray = pizzaAttributes
        ? pizzaAttributes
            .split(',')
            .map((item) => item as EnumPizzaAttributeName)
        : undefined;

      const pizzas = await this.prisma.pizza.findMany({
        orderBy: {
          priceStandard: pizzaSortOrder,
        },
        where: {
          priceStandard: {
            gte: minPrice,
            lte: maxPrice,
          },
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

  async getPizza(pizzaName: string) {
    const pizza = await this.prisma.pizza.findFirst({
      where: {
        pizzaName,
      },
      include: {
        ingredients: true,
        pizzaAttributes: true,
      },
    });
    if (!pizza) {
      throw new NotFoundException(`Pizza with name ${pizzaName} not found`);
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
    pizzaGroup,
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
          pizzaGroup,
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
        include: {
          ingredients: true,
          pizzaAttributes: true,
        },
      });
    });
  }

  async deletePizza({ id }: PizzaIdDto) {
    return this.prisma.$transaction(async () => {
      try {
        const deletedPizza = await this.prisma.pizza.delete({
          where: {
            id,
          },
        });

        return {
          message: `Pizza ${deletedPizza.pizzaName} was successfully deleted`,
        };
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundException(`Pizza with id ${id} not found`);
        }
        throw error;
      }
    });
  }

  async updatePizza(
    pizzaName: string,
    { pizzaAttributes, ingredients, ...data }: UpdatePizzaDto,
  ) {
    return this.prisma.$transaction(async () => {
      const pizzaToUpdate = await this.prisma.pizza.count({
        where: {
          pizzaName,
        },
      });

      if (!pizzaToUpdate) {
        throw new NotFoundException(`Pizza with name ${pizzaName} not found`);
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
          pizzaName,
        },
        data: updateData,
        include: {
          ingredients: true,
          pizzaAttributes: true,
        },
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
