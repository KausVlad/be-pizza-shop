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
}
