import { before } from 'node:test';
import { UserEntityType } from '../tool/authorization.user.enum.js';
import { CognitoJwtVerifier } from 'aws-jwt-verify/cognito-verifier';

export const USER_ACCOUNT_ID = 'a993578a-740a-4ced-b9c6-a8c548093eea' as const;
export const USER_ENTITY_TYPE = UserEntityType.PERSON as const;
export const USER_ENTITY_ID = 'e94e997e-6d91-4138-91d9-20a807e643d3' as const;
export const USER_SUBSCRIPTION_ID = 'a2dd5527-8849-4de8-8c3b-e09c99119387' as const;

const VALID_COGNITO_PAYLOAD = {
    'custom:account_id': USER_ACCOUNT_ID,
    'custom:entity_type': USER_ENTITY_TYPE,
    'custom:entity_id': USER_ENTITY_ID,
    'custom:subscription_id': USER_SUBSCRIPTION_ID,
};

before(async () => {
    /**
     * the only external call:
     */
    CognitoJwtVerifier.create = (() => ({
        verify: async () => VALID_COGNITO_PAYLOAD,
    })) as never;
});
