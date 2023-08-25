import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PizzaModule } from './pizza/pizza.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [PizzaModule],
})
export class AppModule {}
