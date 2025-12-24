import { USER_ACCOUNT_ID } from '../cognito.mock.setup.js';
import { ApolloServer } from '@apollo/server';
import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { ApolloServerAuthorizationService } from '../../plugins/apollo-server/index.js';
import {
    TAuthorizationContext,
    TAuthorizationServerontext,
    UserEntityType,
} from '../../tool/index.js';
import { ApolloServerError, ApolloServerErrorPlugin } from '@ernestdolog/error/apollo-server';
import { ApolloServerAlsPlugin } from '@ernestdolog/async-local-storage/apollo-server';
import { ApolloServerAuthorizationTokenPlugin } from '@ernestdolog/authorization/apollo-server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { TAlsServerContext } from '@ernestdolog/async-local-storage';
import { CommonError } from '@ernestdolog/error';

const authorization = new ApolloServerAuthorizationService({
    userPoolId: 'test-pool',
    clientId: 'test-client',
});

const typeDefs = `#graphql
    type User {
        accountId: String!
        entityType: String!
    }
    type Query {
        me: User
    }
`;

export type TApiServerContext = TAuthorizationContext &
    TAuthorizationServerontext &
    TAlsServerContext<TAuthorizationContext>;

describe('Apollo Server Authorization E2E', { concurrency: false }, () => {
    let server: ApolloServer<TApiServerContext>;
    let serverAddress: string;

    beforeEach(async () => {
        server = new ApolloServer<TApiServerContext>({
            typeDefs,
            resolvers: {
                Query: {
                    me: (_parent, _args, context) => {
                        if (!context.user) {
                            throw new ApolloServerError(CommonError.UNAUTHORIZED);
                        }
                        return {
                            accountId: context.user.accountId,
                            entityType: context.user.entityType,
                        };
                    },
                },
            },
            plugins: [
                new ApolloServerAlsPlugin(),
                new ApolloServerAuthorizationTokenPlugin(),
                new ApolloServerErrorPlugin(),
            ],
            introspection: true,
            csrfPrevention: false,
            persistedQueries: {
                ttl: 900,
            },
        });

        const serverStats = await startStandaloneServer(server, {
            context: async context => authorization.initContext({ req: context.req }),
            listen: { port: 3000 },
        });
        serverAddress = serverStats.url;
    });

    afterEach(async () => {
        await server.stop();
    });

    it('returns user for a valid authorization token', async () => {
        const response = await fetch(serverAddress, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer valid-token',
            },
            body: JSON.stringify({
                query: '{ me { accountId entityType } }',
            }),
        });

        const json = await response.json();

        assert.equal(response.status, 200);
        assert.deepEqual(json.errors, undefined);

        assert.equal(json.data.me.accountId, USER_ACCOUNT_ID);
        assert.equal(json.data.me.entityType, UserEntityType.PERSON);
    });

    it('fails with an authorization error when token is missing', async () => {
        const response = await fetch(serverAddress, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                query: '{ me { accountId entityType } }',
            }),
        });

        const json = await response.json();

        assert.equal(response.status, CommonError.UNAUTHORIZED.httpCode);
        assert.ok(json.errors);
        assert.equal(json.errors[0].message, CommonError.UNAUTHORIZED.message);
        assert.equal(json.data.me, null);
    });
});
