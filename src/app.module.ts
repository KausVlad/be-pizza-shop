import { Module } from '@nestjs/common';
import { PizzaModule } from './pizza/pizza.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, PizzaModule, UserModule],
})
export class AppModule {}
