import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
import { NewRoleForUserDto } from './dto/new-role-for-user.dto';
import { Roles } from '../authorization/decorators/roles.decorator';
import { EnumRole } from '@prisma/client';
import { ActiveUser } from '../decorators/active-user.decorator';
import { IActiveUserData } from '../interfaces/active-user-data.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { UpdateUserCredentialsDto } from './dto/update-user-credentials.dto';

@Auth(EnumAuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(EnumAuthType.Bearer)
  @Get('userinfo')
  async getUserInfo(@ActiveUser() user: IActiveUserData) {
    return await this.authService.getUserInfo(user);
  }

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

  @HttpCode(HttpStatus.OK)
  @Auth(EnumAuthType.Bearer)
  @Patch('changePassword')
  async changePassword(
    @Body() changePassword: ChangePasswordDto,
    @ActiveUser() user: IActiveUserData,
  ) {
    return this.authService.changePassword(changePassword, user);
  }

  @HttpCode(HttpStatus.OK)
  @Auth(EnumAuthType.Bearer)
  @Patch('updateUserCredentials')
  async updateUserCredentials(
    @Body() updateUserCredentials: UpdateUserCredentialsDto,
    @ActiveUser() user: IActiveUserData,
  ) {
    return this.authService.updateUserCredentials(updateUserCredentials, user);
  }

  @HttpCode(HttpStatus.OK)
  @Auth(EnumAuthType.Bearer)
  @Patch('updateUserInfo')
  async updateUserInfo(
    @Body() updateUserInfo: UpdateUserInfoDto,
    @ActiveUser() user: IActiveUserData,
  ) {
    return this.authService.updateUserInfo(updateUserInfo, user);
  }

  @HttpCode(HttpStatus.OK)
  @Auth(EnumAuthType.Bearer)
  @Roles(EnumRole.ADMIN)
  @Patch('role')
  changeRole(@Body() newRoleForUser: NewRoleForUserDto) {
    return this.authService.changeRole(newRoleForUser);
  }
}
