import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { PizzaService } from './pizza.service';
import { PizzaIdDto } from './dto/pizza-id.dto';

@Auth(EnumAuthType.None)
@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  // @Roles('ADMIN', 'MANAGER')
  // @Get('info')
  // getPizza(@ActiveUser() user: IActiveUserData): string {
  //   console.log(user);
  //   return 'pizza';
  // }

  @Get('pizzas')
  getPizzas() {
    return this.pizzaService.getPizzas();
  }

  @Get('/:id')
  getPizza(@Param() params: PizzaIdDto) {
    return this.pizzaService.getPizza(params.id);
  }
}
