import { FastifyError } from 'fastify';
import { ErrorFormattedMessage, ErrorMessageType, TErrorMessage } from '../../index.js';

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
