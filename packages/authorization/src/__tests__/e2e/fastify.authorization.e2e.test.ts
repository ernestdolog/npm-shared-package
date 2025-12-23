import {
    USER_ACCOUNT_ID,
    USER_ENTITY_ID,
    USER_ENTITY_TYPE,
    USER_SUBSCRIPTION_ID,
} from '../cognito.mock.setup.js';
import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { fastifyRequestContext } from '@fastify/request-context';
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
    AuthorizationService,
    AuthorizationTokenContext,
    UserAuthorizationAssertionParameters,
} from '../../plugins/fastify/index.js';
import { TAuthorizationClientProperties, UserDeserializationError } from '../../tool/index.js';
import { ErrorHandler, FastifyInternalError } from '@ernestdolog/error/fastify';
import type { TErrorMessage } from '@ernestdolog/error';

/**
 * Fastify specific reusable request checker
 * Individually implemented, as external cvredidentals are needed
 */
export const auth = (authorizationParameters?: UserAuthorizationAssertionParameters) => {
    const AUTH_PROPERTIES: TAuthorizationClientProperties = {
        userPoolId: 'test-pool',
        clientId: 'test-client',
    };
    const fastifyAuthorizationError = (error: TErrorMessage) => new FastifyInternalError(error);
    const svc = new AuthorizationService(AUTH_PROPERTIES, fastifyAuthorizationError);
    return {
        check: async (request: FastifyRequest) => {
            await svc.placeUserOnRequest(request);
            svc.authenticate(request);
            if (authorizationParameters) {
                svc.authorize(request);
            }
        },
    };
};

describe('Fastify Authorization E2E', { concurrency: false }, () => {
    let server: FastifyInstance;
    let serverAddress: string;

    beforeEach(async () => {
        server = Fastify({ logger: false });
        server.setErrorHandler(ErrorHandler);

        server.register(fastifyRequestContext, {
            defaultStoreValues: request => AuthorizationTokenContext(request),
        });

        server.get('/protected', { onRequest: auth().check }, async request => {
            return { user: request.user };
        });

        await server.ready();

        serverAddress = await server.listen({
            port: 3000,
            host: '0.0.0.0',
        });
    });

    afterEach(async () => {
        await server.close();
    });

    it('returns user on valid authorization', async () => {
        const response = await fetch(`${serverAddress}/protected`, {
            method: 'GET',
            headers: {
                authorization: 'Bearer valid-token',
            },
        });

        assert.strictEqual(response.status, 200);

        const body = await response.json();

        assert.strictEqual(body.user.accountId, USER_ACCOUNT_ID);
        assert.strictEqual(body.user.entityType, USER_ENTITY_TYPE);
        assert.strictEqual(body.user.entityId, USER_ENTITY_ID);
        assert.strictEqual(body.user.subscriptionId, USER_SUBSCRIPTION_ID);
    });

    it('returns structured error on missing authorization', async () => {
        const response = await fetch(`${serverAddress}/protected`, {
            method: 'GET',
        });

        assert.strictEqual(response.status, UserDeserializationError.UNAUTHENTICATED.httpCode);

        const body = await response.json();

        assert.strictEqual(body.name, UserDeserializationError.UNAUTHENTICATED.name);
        assert.strictEqual(body.message, UserDeserializationError.UNAUTHENTICATED.message);
    });
});
