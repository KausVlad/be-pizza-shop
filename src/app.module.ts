import { Module } from '@nestjs/common';
import { PizzaModule } from './pizza/pizza.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { IngredientModule } from './ingredient/ingredient.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DrinkModule } from './drink/drink.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    PizzaModule,
    UserModule,
    ConfigModule.forRoot(),
    IngredientModule,
    CloudinaryModule,
    DrinkModule,
    ProductModule,
  ],
})
export class AppModule {}
