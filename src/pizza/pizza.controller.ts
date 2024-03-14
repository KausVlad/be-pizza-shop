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
import { PizzaNameDto } from './dto/pizza-name.dto';
import { NewPizzaDto } from './dto/new-pizza.dto';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { EnumRole } from '@prisma/client';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { FiltersPizzaDto } from './dto/filters-pizza.dto';

@Auth(EnumAuthType.None)
@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get('all')
  getPizzas(@Query() filters: FiltersPizzaDto) {
    return this.pizzaService.getPizzas(filters);
  }

  @Get('/:pizzaName')
  getPizza(@Param() param: PizzaNameDto) {
    return this.pizzaService.getPizza(param.pizzaName);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addPizza(@Body() body: NewPizzaDto) {
    return this.pizzaService.addPizza(body);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Delete('/:pizzaName')
  deletePizza(@Param() param: PizzaNameDto) {
    return this.pizzaService.deletePizza(param.pizzaName);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Patch('/:pizzaName')
  updatePizza(@Param() param: PizzaNameDto, @Body() body: UpdatePizzaDto) {
    return this.pizzaService.updatePizza(param.pizzaName, body);
  }
}
