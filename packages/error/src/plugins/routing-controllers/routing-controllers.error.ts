import { TErrorMessage } from '#pkg/error/error.message.types.js';
import { HttpError } from 'routing-controllers';
import { ErrorMessageType } from '#pkg/error/error.message.constants.js';
import { ErrorFormattedMessage } from '#pkg/error/error.formatted-message.js';

export class RoutingControllersError extends HttpError {
    readonly type = ErrorMessageType;
    readonly name: string;
    readonly properties: Record<string, unknown>;

    constructor(errorMessage: TErrorMessage, properties?: Record<string, unknown>) {
        properties = properties ?? {};

        const formattedErrorMessage = new ErrorFormattedMessage({
            message: errorMessage.message,
            properties,
        });

        super(errorMessage.httpCode, formattedErrorMessage.text);

        this.name = errorMessage.name;
        this.properties = properties;
    }
}
