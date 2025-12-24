import { FastifyError } from 'fastify';
import { TErrorMessage } from '#pkg/error/error.message.types.js';
import { ErrorMessageType } from '#pkg/error/error.message.constants.js';
import { ErrorFormattedMessage } from '#pkg/error/error.formatted-message.js';

export class FastifyInternalError implements FastifyError {
    readonly type = ErrorMessageType;
    readonly name: string;
    readonly code: string;
    readonly properties: Record<string, unknown>;
    readonly message: string;

    constructor(errorMessage: TErrorMessage, properties?: Record<string, unknown>) {
        properties = properties ?? {};

        const formattedErrorMessage = new ErrorFormattedMessage({
            message: errorMessage.message,
            properties,
        });

        this.name = errorMessage.name;
        this.code = errorMessage.httpCode.toString();
        this.properties = properties;
        this.message = formattedErrorMessage.text;
    }
}
