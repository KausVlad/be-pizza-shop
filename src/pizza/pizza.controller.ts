import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { PizzaService } from './pizza.service';
import { PizzaIdDto } from './dto/pizza-id.dto';
import { NewPizzaDto } from './dto/new-pizza.dto';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { EnumRole } from '@prisma/client';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { FiltersPizzaDto } from './dto/filters-pizza.dto';

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

  @Get('all')
  getPizzas(@Query() filters: FiltersPizzaDto) {
    return this.pizzaService.getPizzas(filters);
  }

  @Get('/:id')
  getPizza(@Param() param: PizzaIdDto) {
    return this.pizzaService.getPizza(param.id);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addPizza(@Body() body: NewPizzaDto) {
    return this.pizzaService.addPizza(body);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Delete('/:id')
  deletePizza(@Param() param: PizzaIdDto) {
    return this.pizzaService.deletePizza(param.id);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Patch('/:id')
  updatePizza(@Param() param: PizzaIdDto, @Body() body: UpdatePizzaDto) {
    return this.pizzaService.updatePizza(param.id, body);
  }
}
