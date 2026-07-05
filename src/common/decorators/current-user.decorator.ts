import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithUser } from '../types/request-with-user.type';

export const CurrentUser = createParamDecorator(
  (property: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return property && user ? user[property as keyof typeof user] : user;
  },
);
