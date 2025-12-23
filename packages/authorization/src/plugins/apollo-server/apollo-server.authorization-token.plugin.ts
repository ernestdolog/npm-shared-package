import type {
    ApolloServerPlugin,
    BaseContext,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from '@apollo/server';
import { AUTHORIZATION_TOKEN_HEADER, TAuthorizationContext } from '../../tool/index.js';
import { TAlsServerContext } from '@ernestdolog/async-local-storage';

/**
 * Plugin to add authenticated user's token to AsyncLocalStorage.
 *
 * ### Example
 *
 * ```typescript
 * ApolloServer({
 *     ...
 *     plugins: [new ApolloServerAuthorizationTokenPlugin()],
 * })
 * ```
 */
export class ApolloServerAuthorizationTokenPlugin<
    TContext extends TAuthorizationContext = TAuthorizationContext,
> implements ApolloServerPlugin
{
    async requestDidStart(
        requestContext: GraphQLRequestContext<BaseContext & TAlsServerContext<TContext>>,
    ): Promise<GraphQLRequestListener<TContext> | void> {
        const headers = requestContext.request.http?.headers;

        const authorizationToken = headers?.get(AUTHORIZATION_TOKEN_HEADER);
        const als = requestContext.contextValue.als;

        const storage = als?.storage || ({} as TContext);
        storage.authorizationToken = authorizationToken;

        als!.instance.enterWith(storage);

        return {
            didResolveSource: async () => {
                als!.instance.enterWith(storage);
            },
        };
    }
}
