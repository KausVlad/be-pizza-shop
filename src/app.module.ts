import { Module } from '@nestjs/common';
import { PizzaModule } from './pizza/pizza.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, PizzaModule, UserModule, ConfigModule.forRoot()],
})
export class AppModule {}
