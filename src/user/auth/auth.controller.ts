import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-In.dto';
import { SetRefreshTokenCookie } from './decorators/set-refresh-token-cookie.decorator';
import { ISetRefreshTokenCookie } from '../interfaces/set-refresh-token-cookie.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetRefreshTokenCookie } from './decorators/get-refresh-token-cookie.decorator';
import { Auth } from './decorators/auth.decorator';
import { EnumAuthType } from './enums/auth-type.enum';

@Auth(EnumAuthType.None)
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
    return { accessToken };
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
    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refreshTokens')
  async refreshTokens(
    @GetRefreshTokenCookie('refreshToken') refreshTokenDto: RefreshTokenDto,
    @SetRefreshTokenCookie()
    setRefreshTokenCookie: ISetRefreshTokenCookie,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(refreshTokenDto);
    setRefreshTokenCookie(refreshToken);
    return { accessToken };
  }

  @Get('signOut')
  async signOut(
    @Res() res: Response,
    @GetRefreshTokenCookie('refreshToken') refreshTokenDto: RefreshTokenDto,
  ) {
    await this.authService.signOut(refreshTokenDto);
    res.clearCookie('refreshToken');
    return res.status(HttpStatus.OK).send('Logged out successfully');
  }

  @Post('role')
  changeRole(@Body() newRoleForUser: newRoleForUserDto) {}
}
