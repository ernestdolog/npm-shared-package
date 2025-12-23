import type {
    ApolloServerPlugin,
    BaseContext,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import { ApolloServerError } from './apollo-server.error.js';
import { getLogger } from '@ernestdolog/logging';
import { ApolloServerExternalErrorInterceptor } from './apollo-server.error.interceptor.js';

/**
 * Plugin to modify 3rd party errors to our internal one.
 *
 * Does not modify internal errors.
 * Keeps original error message.
 *
 * ### Example
 *
 * ```typescript
 *
 *  ApolloServer({
 *      ...
 *      plugins: [new ApolloServerErrorPlugin()],
 *  })
 * ```
 * p.s.: by the existence of this plugin no need to log errors in the server side
 */
export class ApolloServerErrorPlugin<TContext extends BaseContext> implements ApolloServerPlugin {
    async requestDidStart(): Promise<GraphQLRequestListener<TContext> | void> {
        return {
            willSendResponse: async (
                requestContext: GraphQLRequestContext<BaseContext>,
            ): Promise<void> => {
                if (requestContext.errors) {
                    const normalizedErrors = this.normalizeErrors(requestContext.errors);
                    const castedErrors = normalizedErrors
                        .flat(1)
                        .map(error => this.castError(error));
                    (requestContext.errors as unknown) = castedErrors;
                    requestContext.response.http.status = castedErrors[0].httpCode;
                }
            },
        };
    }

    private castError(error: GraphQLError): ApolloServerError {
        const l = getLogger();
        const exception = error.extensions.exception;
        const isInternal = ApolloServerExternalErrorInterceptor.isInternal(exception);
        if (isInternal) {
            l.child({
                cls: 'ApolloServerErrorPlugin',
                ctx: exception,
            }).error('server error caught');
            return exception as ApolloServerError;
        } else {
            const externalError = new ApolloServerExternalErrorInterceptor(error);
            const internalServerError = new ApolloServerError(externalError.internalError, {
                message: externalError.messagified,
            });
            l.child({
                cls: 'ApolloServerErrorPlugin',
                ctx: internalServerError,
            }).error('3rd party error caught');
            return internalServerError;
        }
    }

    private normalizeErrors(errors: readonly GraphQLError[]): GraphQLError[] {
        const normalizedErrors = errors
            .map(error => {
                if (!!error.extensions.response && typeof error.extensions.response === 'object') {
                    const response = error.extensions.response;
                    if (
                        'body' in response &&
                        !!response.body &&
                        typeof response.body === 'object'
                    ) {
                        const body = response.body;
                        return 'errors' in body ? (body.errors as GraphQLError) : undefined;
                    }
                }
                return error;
            })
            .filter(Boolean) as GraphQLError[];

        return normalizedErrors;
    }
}
