import { ErrorInterceptor } from '#pkg/error/error.interceptor.js';
import { TErrorMessage } from '#pkg/error/error.message.types.js';
import {
    ERROR_CODE_INTERCEPT_LIBRARY,
    CODE_INTERCEPT_DEFAULT,
    HTTP_CODE_INTERCEPT_LIBRARY,
} from './apollo-server.error.constants.js';

export class ApolloServerExternalErrorInterceptor extends ErrorInterceptor {
    constructor(error: unknown) {
        super(error);
    }

    get internalError(): TErrorMessage {
        if (this.error && typeof this.error === 'object') {
            const casedError = this.castError(this.error);
            if (casedError) return casedError;
            if ('extensions' in this.error && typeof this.error.extensions === 'object') {
                const casedError = this.castError(this.error.extensions!);
                if (casedError) return casedError;
            }
        }
        return this.defaultInterceptedError;
    }

    protected get interceptedHttpCodes(): Record<string, TErrorMessage> {
        return HTTP_CODE_INTERCEPT_LIBRARY;
    }

    protected get interceptedErrorCodes(): Record<string, TErrorMessage> {
        return ERROR_CODE_INTERCEPT_LIBRARY;
    }

    protected get defaultInterceptedError(): TErrorMessage {
        return CODE_INTERCEPT_DEFAULT;
    }
}
