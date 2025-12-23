import {
    CognitoJwtVerifier,
    CognitoJwtVerifierSingleUserPool,
    CognitoJwtVerifierProperties,
} from 'aws-jwt-verify/cognito-verifier';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import type { TAuthorizationClientProperties } from './authorization.types.js';
import { UserDeserializationError } from './authorization.error.js';
import { TErrorFactory, defaultErrorFactory } from './authorization.error.factory.js';

class AuthorizationVerifyClient {
    private client: CognitoJwtVerifierSingleUserPool<CognitoJwtVerifierProperties>;

    constructor(
        private readonly properties: TAuthorizationClientProperties,
        private readonly errorFactory: TErrorFactory = defaultErrorFactory,
    ) {
        this.client = CognitoJwtVerifier.create<CognitoJwtVerifierProperties>({
            userPoolId: this.properties.userPoolId,
            clientId: this.properties.clientId,
            tokenUse: 'id',
        });
    }

    async verify(jwt: string): Promise<CognitoJwtPayload> {
        try {
            return this.client.verify(jwt, {
                clientId: this.properties.clientId,
                tokenUse: 'id',
            });
        } catch {
            throw this.errorFactory(UserDeserializationError.UNAUTHENTICATED);
        }
    }
}

let authorizationVerifyClient: AuthorizationVerifyClient;
let currentErrorFactory: TErrorFactory = defaultErrorFactory;

export function getAuthorizationVerifyClient(
    properties: TAuthorizationClientProperties,
    errorFactory: TErrorFactory = defaultErrorFactory,
): AuthorizationVerifyClient {
    if (!authorizationVerifyClient || currentErrorFactory !== errorFactory) {
        currentErrorFactory = errorFactory;
        authorizationVerifyClient = new AuthorizationVerifyClient(properties, errorFactory);
    }
    return authorizationVerifyClient;
}
