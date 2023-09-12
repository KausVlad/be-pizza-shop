import { Module } from '@nestjs/common';
import { PizzaModule } from './pizza/pizza.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PizzaModule, UserModule, ConfigModule.forRoot()],
})
export class AppModule {}
