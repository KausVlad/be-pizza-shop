import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IActiveUserData } from '../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../user.constants';

export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUserData | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: IActiveUserData | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
