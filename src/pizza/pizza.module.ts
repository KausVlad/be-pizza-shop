import { Module } from '@nestjs/common';
import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PizzaController],
  providers: [PizzaService],
})
export class PizzaModule {}
