import { GraphQLError } from 'graphql';
import { TErrorMessage } from '#pkg/error/error.message.types.js';
import { ErrorMessageType } from '#pkg/error/error.message.constants.js';
import { ErrorFormattedMessage } from '#pkg/error/error.formatted-message.js';

export class ApolloServerError extends GraphQLError {
    readonly type = ErrorMessageType;
    readonly httpCode: number;
    readonly name: string;
    readonly message: string;
    readonly properties: Record<string, unknown>;

    constructor(errorMessage: TErrorMessage, properties?: Record<string, unknown>) {
        properties = properties ?? {};

        const formattedErrorMessage = new ErrorFormattedMessage({
            message: errorMessage.message,
            properties,
        });

        super(formattedErrorMessage.text, properties);

        this.httpCode = errorMessage.httpCode;
        this.name = errorMessage.name;
        this.message = formattedErrorMessage.text;
        this.properties = properties;

        this.extensions.exception = {
            type: this.type,
            httpCode: this.httpCode,
            name: this.name,
            properties: this.properties,
        };
    }
}
