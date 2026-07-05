import { AuthenticatedUser } from './authenticated-user.type';

export type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
};
