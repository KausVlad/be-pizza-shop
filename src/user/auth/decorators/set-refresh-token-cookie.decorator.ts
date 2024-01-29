import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

export const SetRefreshTokenCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse<Response>();
    return (refreshToken: string) => {
      return response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: true,
        secure: true, //TODO change to true
      });
    };
  },
);
