import { TAuthorizationRole } from '../../tool/index.js';
import { Authorized } from 'routing-controllers';

export const AuthorizedUser = (roles?: TAuthorizationRole[]) => Authorized(roles);
export type AuthorizedUser = typeof AuthorizedUser;
