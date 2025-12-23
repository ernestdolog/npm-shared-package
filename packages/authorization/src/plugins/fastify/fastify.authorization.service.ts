import {
    AUTHORIZATION_TOKEN_HEADER,
    TAuthorizationClientProperties,
    getAuthorizationVerifyClient,
    TErrorFactory,
    UserDeserializationError,
} from '../../tool/index.js';
import { CognitoUser } from '../../tool/cognito.user.entity.js';
import { FastifyRequest } from 'fastify';
import { UserAuthorizationAssertionParameters } from './fastify.authorization-user-assertion.js';

export class AuthorizationService {
    constructor(
        private readonly properties: TAuthorizationClientProperties,
        private readonly errorFactory: TErrorFactory,
        private readonly authorizationParameters?: UserAuthorizationAssertionParameters,
    ) {}

    async placeUserOnRequest(request: FastifyRequest): Promise<void> {
        const token: string | string[] | null | undefined =
            request.headers[AUTHORIZATION_TOKEN_HEADER];
        if (!token || Array.isArray(token) || !token.startsWith('Bearer ')) {
            return undefined;
        }
        const authorizationClient = getAuthorizationVerifyClient(
            this.properties,
            this.errorFactory,
        );
        const jwt = token.replace('Bearer ', '');

        const userObject = await authorizationClient.verify(jwt);
        const user = new CognitoUser(userObject, this.errorFactory).deserialize();
        request.user = user;
    }

    authenticate(request: FastifyRequest): void {
        if (!request.user) throw this.errorFactory(UserDeserializationError.UNAUTHENTICATED);
    }

    authorize(request: FastifyRequest): void {
        if (this.authorizationParameters && request) {
            /**@todo: implement authorization logic */
        }
    }
}
