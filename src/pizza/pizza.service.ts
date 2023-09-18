import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PizzaService {
  constructor(private readonly prisma: PrismaService) {}

  getPizzas() {
    return this.prisma.pizza.findMany({
      include: {
        ingredients: true,
        pizzaAttributes: true,
      },
    });
  }

  getPizza(id: number) {
    return this.prisma.pizza.findUnique({
      where: {
        id,
      },
      include: {
        ingredients: true,
        pizzaAttributes: true,
      },
    });
  }
}
