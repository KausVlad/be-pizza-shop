import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetRefreshTokenCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const refreshToken = data ? request.cookies?.[data] : request.cookies;
    return { refreshToken };
  },
);
