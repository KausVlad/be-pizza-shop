import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/signUp.dto';
import { AuthService } from './auth.service';
import { SignInDto } from '../dto/signIn.dto';
import { SetRefreshTokenCookie } from './decorators/set-refresh-token-cookie.decorator';
import { ISetRefreshTokenCookie } from '../interfaces/set-refresh-token-cookie.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  signUp(@Body() signUp: SignUpDto) {
    return this.authService.signUp(signUp);
  }

  @Post('signIn')
  async signIn(
    @Body() signIn: SignInDto,
    @SetRefreshTokenCookie()
    setRefreshTokenCookie: ISetRefreshTokenCookie,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(signIn);
    setRefreshTokenCookie(refreshToken);
    return accessToken;
  }
}
