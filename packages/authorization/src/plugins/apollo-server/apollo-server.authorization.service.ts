import {
    AUTHORIZATION_TOKEN_HEADER,
    TAuthorizationClientProperties,
    TAuthorizationRole,
    User,
    getAuthorizationVerifyClient,
    CognitoUser,
    TAuthorizationServerontext,
    TErrorFactory,
    defaultErrorFactory,
} from '../../tool/index.js';
import { AuthChecker } from 'type-graphql';

export class ApolloServerAuthorizationService {
    constructor(
        private readonly properties: TAuthorizationClientProperties,
        private readonly errorFactory: TErrorFactory = defaultErrorFactory,
    ) {}

    async initContext({ req }: { req: unknown }): Promise<TAuthorizationServerontext> {
        const user = await this.getUserFromToken(req);
        return { user };
    }

    gqlAuthChecker: AuthChecker<TAuthorizationServerontext, TAuthorizationRole> = (
        { context: { user } },
        roles?: TAuthorizationRole[],
    ): boolean => {
        if (!user) return false;
        if (!roles?.length) return !!user;
        const isUserRolesMatch = !roles.find(role => {
            if (role.entityType && user.entityType !== role.entityType) return true;
            return false;
        });
        return isUserRolesMatch;
    };

    private async getUserFromToken(request: unknown): Promise<User | undefined> {
        const isRequestValid = !!request && typeof request === 'object' && 'headers' in request;
        if (!isRequestValid) return undefined;

        const token: string | null | undefined = (
            request.headers as Record<string, string | null | undefined>
        )[AUTHORIZATION_TOKEN_HEADER];
        if (!token || !token.startsWith('Bearer ')) return undefined;

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
