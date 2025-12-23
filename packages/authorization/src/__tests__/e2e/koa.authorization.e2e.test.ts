/**
 * Routing-Controllers specific trickery
 * It is how it is...
 */
import 'reflect-metadata';

import {
    USER_ACCOUNT_ID,
    USER_ENTITY_ID,
    USER_ENTITY_TYPE,
    USER_SUBSCRIPTION_ID,
} from '../cognito.mock.setup.js';
import assert from 'node:assert/strict';
import Koa, { DefaultState } from 'koa';
import http from 'http';
import { useKoaServer, JsonController, Post, HttpCode, CurrentUser } from 'routing-controllers';
import {
    AuthorizedUser,
    KoaAuthorizationService,
    KoaAuthorizationTokenMiddleware,
} from '../../plugins/koa/index.js';
import { User } from '../../tool/index.js';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { KoaServerAlsMiddleware } from '@ernestdolog/async-local-storage/koa';
import { KoaErrorMiddleware } from '@ernestdolog/error/routing-controllers/koa';
import { RoutingControllersError } from '@ernestdolog/error/routing-controllers';
import { CommonError, TErrorMessage } from '@ernestdolog/error';

@JsonController('/test/auth')
class TestAuthController {
    @Post()
    @AuthorizedUser()
    @HttpCode(200)
    async test(@CurrentUser() user: User) {
        return user;
    }
}

const fastifyAuthorizationError = (error: TErrorMessage) => new RoutingControllersError(error);
const authentication = new KoaAuthorizationService(
    {
        userPoolId: 'test-pool',
        clientId: 'test-client',
    },
    fastifyAuthorizationError,
);

describe('Koa Authorization E2E - minimal test', { concurrency: false }, () => {
    let server: http.Server;
    let serverAddress: string;

    beforeEach(async () => {
        const koaServer = new Koa();

        server = http.createServer(koaServer.callback());

        const controllers = [TestAuthController] as never[];

        koaServer.use(KoaServerAlsMiddleware);
        koaServer.use(KoaAuthorizationTokenMiddleware);
        koaServer.use(KoaErrorMiddleware);

        useKoaServer<DefaultState>(koaServer, {
            controllers,
            defaultErrorHandler: false,
            authorizationChecker: parameters => authentication.authorizationChecker(parameters),
            currentUserChecker: parameters => authentication.currentUserChecker(parameters),
        }),
            await new Promise<void>(resolve => {
                server.listen(0, () => {
                    const addr = server.address() as any;
                    serverAddress = `http://localhost:${addr.port}`;
                    resolve();
                });
            });
    });

    afterEach(async () => {
        server.close();
    });

    it('authorizes user on valid token', async () => {
        const response = await fetch(`${serverAddress}/test/auth`, {
            method: 'POST',
            headers: { authorization: 'Bearer valid-token' },
        });

        assert.strictEqual(response.status, 200);

        const body = await response.json();
        assert.strictEqual(body.accountId, USER_ACCOUNT_ID);
        assert.strictEqual(body.entityType, USER_ENTITY_TYPE);
        assert.strictEqual(body.entityId, USER_ENTITY_ID);
        assert.strictEqual(body.subscriptionId, USER_SUBSCRIPTION_ID);
    });

    it('rejects authorization on missing token', async () => {
        const response = await fetch(`${serverAddress}/test/auth`, { method: 'POST' });

        assert.strictEqual(response.status, CommonError.UNAUTHORIZED.httpCode);

        const body = await response.json();
        assert.strictEqual(body.name, CommonError.UNAUTHORIZED.name);
        assert.strictEqual(body.message, CommonError.UNAUTHORIZED.message);
    });
});
