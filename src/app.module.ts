import { Module } from '@nestjs/common';
import { PizzaModule } from './pizza/pizza.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PizzaModule, UserModule],
})
export class AppModule {}
