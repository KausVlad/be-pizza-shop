import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as cookie from 'cookie';

export const SetRefreshTokenCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    return (refreshToken: string) => {
      const refreshCookie = cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: true,
        secure: false, //TODO change to true
      });

      response.setHeader('Set-Cookie', refreshCookie);
    };
  },
);
