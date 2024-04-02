import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { DrinkService } from './drink.service';
import { DrinkNameDto } from './dto/drink-name.dto';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { EnumRole } from '@prisma/client';
import { NewDrinkDto } from './dto/new-drink.dto';

@Controller('drink')
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) {}

  @Auth(EnumAuthType.None)
  @Get('all')
  getDrinks() {
    return this.drinkService.getDrinks();
  }

  @Auth(EnumAuthType.None)
  @Get('/:drinkName')
  getDrink(@Param() param: DrinkNameDto) {
    return this.drinkService.getDrink(param);
  }

  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addDrink(@Body() body: NewDrinkDto) {
    return this.drinkService.addDrink(body);
  }
}
