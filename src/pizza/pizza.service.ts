import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PizzaIdDto } from './dto/pizza-id.dto';

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
}
