import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DrinkService {
  constructor(private readonly prisma: PrismaService) {}

  getDrinks() {
    return this.prisma.drink.findMany();
  }

  async getDrink(drinkName: string) {
    const drink = await this.prisma.drink.findUnique({
      where: {
        drinkName: drinkName,
      },
    });

    if (!drink) {
      throw new NotFoundException(`Drink with name ${drinkName} not found`);
    }

    return drink;
  }
}
