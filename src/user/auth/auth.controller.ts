import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/signUp.dto';
import { AuthService } from './auth.service';
import { SignInDto } from '../dto/signIn.dto';
import { SetRefreshTokenCookie } from './decorators/set-refresh-token-cookie.decorator';
import { ISetRefreshTokenCookie } from '../interfaces/set-refresh-token-cookie.interface';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { GetRefreshTokenCookie } from './decorators/get-refresh-token-cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(
    @Body() signUp: SignUpDto,
    @SetRefreshTokenCookie()
    setRefreshTokenCookie: ISetRefreshTokenCookie,
  ) {
    const { accessToken, refreshToken } = await this.authService.signUp(signUp);
    setRefreshTokenCookie(refreshToken);
    return accessToken;
  }

  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.OK)
  @Post('refreshTokens')
  refreshTokens(
    @GetRefreshTokenCookie('refreshToken') refreshToken: RefreshTokenDto,
  ) {
    return this.authService.refreshTokens(refreshToken);
  }
}
