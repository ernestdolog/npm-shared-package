import { TAuthorizationRole } from '../../tool/index.js';
import { Authorized } from 'type-graphql';

export const AuthorizedUser: typeof Authorized<TAuthorizationRole> = Authorized<TAuthorizationRole>;
export type AuthorizedUser = typeof AuthorizedUser;
