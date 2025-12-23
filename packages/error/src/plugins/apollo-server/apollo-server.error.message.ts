export abstract class ErrorMessage {}

export class ApolloServerErrorMessage extends ErrorMessage {
    static PERSISTED_QUERY_NOT_FOUND = {
        httpCode: 200,
        name: 'PERSISTED_QUERY_NOT_FOUND',
        message: 'PersistedQueryNotFound',
    };
    static GRAPHQL_VALIDATION_FAILED = {
        httpCode: 422,
        name: 'GRAPHQL_VALIDATION_FAILED',
        message: 'GraphQL validation failed',
    };
}
