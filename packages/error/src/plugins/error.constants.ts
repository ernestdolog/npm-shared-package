import { CommonError, TErrorMessage } from '#pkg/index.js';
import { ApolloServerErrorMessage } from './apollo-server/apollo-server.error.message.js';

export const HTTP_CODE_INTERCEPT_LIBRARY: Record<string, TErrorMessage> = {
    '401': CommonError.UNAUTHORIZED,
    '403': CommonError.FORBIDDEN,
    '404': CommonError.NOT_FOUND,
    '500': CommonError.INTERNAL_SERVER_ERROR,
} as const;

export const ERROR_CODE_INTERCEPT_LIBRARY: Record<string, TErrorMessage> = {
    UNAUTHENTICATED: CommonError.UNAUTHORIZED,
    PERSISTED_QUERY_NOT_FOUND: ApolloServerErrorMessage.PERSISTED_QUERY_NOT_FOUND,
    GRAPHQL_VALIDATION_FAILED: ApolloServerErrorMessage.GRAPHQL_VALIDATION_FAILED,
} as const;

export const CODE_INTERCEPT_DEFAULT: TErrorMessage = CommonError.INTERNAL_SERVER_ERROR;
