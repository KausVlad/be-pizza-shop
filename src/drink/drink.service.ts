import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DrinkNameDto } from './dto/drink-name.dto';
import { NewDrinkDto } from './dto/new-drink.dto';

@Injectable()
export class DrinkService {
  constructor(private readonly prisma: PrismaService) {}

  // getDrinks() {
  //   return this.prisma.drink.findMany();
  // }

  // async getDrink({ drinkName }: DrinkNameDto) {
  //   const drink = await this.prisma.drink.findUnique({
  //     where: {
  //       drinkName,
  //     },
  //   });

  //   if (!drink) {
  //     throw new NotFoundException(`Drink with name ${drinkName} not found`);
  //   }

  //   return drink;
  // }

  // async addDrink(data: NewDrinkDto) {
  //   console.log(data);

  //   await this.uniqueDrinkCheck(data.drinkName);

  //   return this.prisma.drink.create({
  //     data,
  //   });
  // }

  // private async uniqueDrinkCheck(drinkName: string) {
  //   const drink = await this.prisma.drink.count({
  //     where: {
  //       drinkName,
  //     },
  //   });

  //   if (drink) {
  //     throw new ConflictException(
  //       `Drink with name ${drinkName} already exists`,
  //     );
  //   }
  // }
}
