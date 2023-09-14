import { Controller, Get } from '@nestjs/common';
import { ActiveUser } from 'src/user/decorators/active-user.decorator';
import { IActiveUserData } from 'src/user/interfaces/active-user-data.interface';

@Controller('pizza')
export class PizzaController {
  @Get('info')
  getPizza(@ActiveUser() user: IActiveUserData): string {
    console.log(user);
    return 'pizza';
  }
}
