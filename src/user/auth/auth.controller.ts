import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/signUp.dto';
import { AuthService } from './auth.service';
import { SignInDto } from '../dto/signIn.dto';
import { SetRefreshTokenCookie } from './decorators/set-refresh-token-cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  signUp(@Body() signUp: SignUpDto) {
    return this.authService.signUp(signUp);
  }

  // @Post('signIn')
  // async signIn(
  //   @Body() signIn: SignInDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const { accessToken, refreshToken } = await this.authService.signIn(signIn);
  //   response.cookie('refreshToken', refreshToken, {
  //     httpOnly: true,
  //     sameSite: true,
  //     secure: false, // TODO
  //   });
  //   return accessToken;
  // }

  @Post('signIn')
  async signIn(
    @Body() signIn: SignInDto,
    @SetRefreshTokenCookie() setRefreshTokenCookie: (token: string) => void,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(signIn);
    setRefreshTokenCookie(refreshToken);
    return accessToken;
  }
}
