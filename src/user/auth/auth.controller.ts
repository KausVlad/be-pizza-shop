import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/signUp.dto';
import { AuthService } from './auth.service';
import { SignInDto } from '../dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  signUp(@Body() signUp: SignUpDto) {
    return this.authService.signUp(signUp);
  }

  @Post('signIn')
  signIn(@Body() signIn: SignInDto) {
    return this.authService.signIn(signIn);
  }
}
