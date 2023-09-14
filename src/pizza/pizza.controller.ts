import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { ActiveUser } from 'src/user/decorators/active-user.decorator';
import { IActiveUserData } from 'src/user/interfaces/active-user-data.interface';

@Controller('pizza')
export class PizzaController {
  @Roles('ADMIN', 'USER')
  @Get('info')
  getPizza(@ActiveUser() user: IActiveUserData): string {
    console.log(user);
    return 'pizza';
  }
}
