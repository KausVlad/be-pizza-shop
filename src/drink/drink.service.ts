import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DrinkService {
  constructor(private readonly prisma: PrismaService) {}

  getDrinks() {
    return this.prisma.drink.findMany();
  }
}
