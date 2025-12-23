import type {
    ApolloServerPlugin,
    BaseContext,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from '@apollo/server';
import { TAlsServerContext, getAsyncLocalStorage } from '@ernestdolog/async-local-storage';

type TRequestContext<T> = BaseContext & TAlsServerContext<T>;

/**
 * Plugin to add Authenticated users token to the Als.
 *
 * Places Als singleton instance at the context
 * To be called as early as possible from plugins
 *
 * ### Example
 *
 * ```typescript
 *
 *  ApolloServer({
 *      ...
 *      plugins: [new ApolloServerAlsPlugin()],
 *  })
 * ```
 */
export class ApolloServerAlsPlugin<TAlsContext> implements ApolloServerPlugin {
    async requestDidStart(
        requestContext: GraphQLRequestContext<TRequestContext<TAlsContext>>,
    ): Promise<GraphQLRequestListener<TRequestContext<TAlsContext>> | void> {
        requestContext.contextValue.als = getAsyncLocalStorage<TAlsContext>();

        const storage = requestContext.contextValue.als?.storage || ({} as TAlsContext);

        return {
            didResolveSource: async () => {
                requestContext.contextValue.als!.instance.enterWith(storage);
            },
        };
    }
}
