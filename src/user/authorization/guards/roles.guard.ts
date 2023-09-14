import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EnumRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IActiveUserData } from 'src/user/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/user/user.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<EnumRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!contextRoles) {
      return true;
    }
    const user: IActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];
    return contextRoles.some((role) => user.role === role);
  }
}
