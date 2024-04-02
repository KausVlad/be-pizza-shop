import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { DrinkService } from './drink.service';

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
  getDrink() {}
}
