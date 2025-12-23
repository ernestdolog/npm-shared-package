import { ErrorFormattedMessage } from '#pkg/error/error.formatted-message.js';
import { ErrorMessageType, TErrorMessage } from '#pkg/index.js';
import { HttpError } from 'routing-controllers';

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
