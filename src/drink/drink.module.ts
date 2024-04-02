import { Module } from '@nestjs/common';
import { DrinkController } from './drink.controller';
import { DrinkService } from './drink.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DrinkController],
  providers: [DrinkService],
})
export class DrinkModule {}
