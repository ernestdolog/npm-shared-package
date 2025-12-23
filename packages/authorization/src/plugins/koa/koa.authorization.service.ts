import { Action } from 'routing-controllers/types/Action.js';
import {
    AUTHORIZATION_TOKEN_HEADER,
    TAuthorizationClientProperties,
    TAuthorizationRole,
    User,
    getAuthorizationVerifyClient,
    CognitoUser,
    TErrorFactory,
    defaultErrorFactory,
} from '../../tool/index.js';

export class KoaAuthorizationService {
    constructor(
        private readonly properties: TAuthorizationClientProperties,
        private readonly errorFactory: TErrorFactory = defaultErrorFactory,
    ) {}

    async authorizationChecker(action: Action, roles?: TAuthorizationRole[]): Promise<boolean> {
        const user = await this.getUserFromToken(action);
        if (!user) return false;
        if (!roles?.length) return !!user;
        const isUserRolesMatch = !roles.find(role => {
            if (role.entityType && user.entityType !== role.entityType) return true;
            return false;
        });
        return isUserRolesMatch;
    }

    currentUserChecker(action: Action): Promise<User | undefined> {
        return this.getUserFromToken(action);
    }

    private async getUserFromToken(action: Action): Promise<User | undefined> {
        const token: string | null | undefined = action.request.headers[AUTHORIZATION_TOKEN_HEADER];
        if (!token || !token.startsWith('Bearer ')) {
            return undefined;
        }

        try {
            const authorizationClient = getAuthorizationVerifyClient(
                this.properties,
                this.errorFactory,
            );
            const jwt = token.replace('Bearer ', '');
            const payload = await authorizationClient.verify(jwt);
            return new CognitoUser(payload, this.errorFactory).deserialize();
        } catch {
            return undefined;
        }
    }
}
