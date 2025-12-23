import type {
    ApolloServerPlugin,
    BaseContext,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from '@apollo/server';
import { REQUEST_ID_HEADER, RequestId } from '#pkg/index.js';
import { TAlsServerContext } from '@ernestdolog/async-local-storage';
import { TRequestIdContext } from '#pkg/request-id/request-id.types.js';

type TRequestContext<T> = BaseContext & TAlsServerContext<T>;

/**
 * Plugin to add request id to the Als.
 *
 * If requestId isn't in the header, generates one
 * Places in ALS
 *
 * ### Example
 *
 * ```typescript
 *
 *  ApolloServer({
 *      ...
 *      plugins: [new ApolloServerRequestIdPlugin()],
 *  })
 * ```
 */
export class ApolloServerRequestIdPlugin<TContext extends TRequestIdContext = TRequestIdContext>
    implements ApolloServerPlugin
{
    async requestDidStart(
        requestContext: GraphQLRequestContext<TRequestContext<TContext>>,
    ): Promise<GraphQLRequestListener<TRequestContext<TContext>> | void> {
        const headers = requestContext.request.http?.headers;
        let requestId = headers?.get(REQUEST_ID_HEADER);
        if (!requestId) {
            requestId = new RequestId().value;
        }

        const als = requestContext.contextValue.als;

        const storage = als?.storage || ({} as TContext);
        storage.requestId = requestId;

        als!.instance.enterWith(storage);

        return {
            didResolveSource: async () => {
                als!.instance.enterWith(storage);
            },
        };
    }
}
