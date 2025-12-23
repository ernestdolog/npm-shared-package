import { UserDeserializationError } from './authorization.error.js';
import { User } from './authorization.user.entity.js';
import { UserEntityType } from './authorization.user.enum.js';
import {
    ACCOUNT_ID_FIELD,
    ENTITY_ID_FIELD,
    ENTITY_TYPE_FIELD,
    SUBSCRIPTION_ID_FIELD,
} from './authorization.constants.js';
import { TErrorFactory, defaultErrorFactory } from './authorization.error.factory.js';

export class CognitoUser {
    constructor(
        private readonly externalObject: unknown,
        private readonly errorFactory: TErrorFactory = defaultErrorFactory,
    ) {}

    deserialize(): User {
        if (!this.externalObject || typeof this.externalObject !== 'object')
            throw this.errorFactory(UserDeserializationError.INVALID_FORMAT);
        if (!(ACCOUNT_ID_FIELD in this.externalObject))
            throw this.errorFactory(UserDeserializationError.MISSING_ACCOUNT_ID);
        if (!(ENTITY_TYPE_FIELD in this.externalObject))
            throw this.errorFactory(UserDeserializationError.MISSING_ENTITY_TYPE);
        if (!(ENTITY_ID_FIELD in this.externalObject))
            throw this.errorFactory(UserDeserializationError.MISSING_ENTITY_ID);
        if (!(SUBSCRIPTION_ID_FIELD in this.externalObject))
            throw this.errorFactory(UserDeserializationError.MISSING_SUBSCRIPTION_ID);

        const accountId = (this.externalObject as Record<string, unknown>)[
            ACCOUNT_ID_FIELD
        ]?.toString();
        if (!accountId || typeof accountId !== 'string')
            throw this.errorFactory(UserDeserializationError.INVALID_ACCOUNT_ID);

        const entityType = (this.externalObject as Record<string, unknown>)[
            ENTITY_TYPE_FIELD
        ] as UserEntityType;
        if (!entityType || typeof entityType !== 'string' || !UserEntityType[entityType])
            throw this.errorFactory(UserDeserializationError.INVALID_ENTITY_TYPE);

        const entityId = (this.externalObject as Record<string, unknown>)[
            ENTITY_ID_FIELD
        ]?.toString();
        if (!entityId) throw this.errorFactory(UserDeserializationError.INVALID_ENTITY_ID);

        const subscriptionId = (this.externalObject as Record<string, unknown>)[
            SUBSCRIPTION_ID_FIELD
        ]?.toString();
        if (!subscriptionId)
            throw this.errorFactory(UserDeserializationError.INVALID_SUBSCRIPTION_ID);

        return new User({
            accountId,
            entityType,
            entityId,
            subscriptionId,
        });
    }
}
