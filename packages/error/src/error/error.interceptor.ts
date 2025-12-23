import { TErrorMessage } from './error.message.types.js';
import { ErrorMessageType } from './error.message.constants.js';

export abstract class ErrorInterceptor {
    readonly error: unknown;

    constructor(error: unknown) {
        this.error = error;
    }

    static isInternal(error: unknown) {
        return (
            error && typeof error === 'object' && 'type' in error && error.type === ErrorMessageType
        );
    }

    /**
     * Override if Your single-error cast to message is different
     */
    get messagified(): unknown {
        return !!this.error && typeof this.error === 'object' && 'message' in this.error
            ? this.error.message
            : typeof this.error === 'object'
              ? JSON.stringify(this.error)
              : this.error;
    }

    /**
     * Override if Your single-error cast to Internal Error is different
     */
    get internalError(): TErrorMessage {
        if (this.error && typeof this.error === 'object') {
            const casedError = this.castError(this.error);
            if (casedError) return casedError;
        }
        return this.defaultInterceptedError;
    }

    /**
     * Override if Your single-error cast to Internal Error is different
     */
    protected castError(input: object): TErrorMessage | undefined {
        if ('httpCode' in input) {
            const httpCode = `${input.httpCode}`;
            return (
                this.interceptedHttpCodes[httpCode as keyof typeof this.interceptedHttpCodes] ??
                this.defaultInterceptedError
            );
        }
        if ('code' in input) {
            const code = `${input.code}`;
            return (
                this.interceptedErrorCodes[code as keyof typeof this.interceptedErrorCodes] ??
                this.defaultInterceptedError
            );
        }
    }

    /**
     * HTTP codes like '400'
     * and a related internal error to throw in case we intercept
     * this given HTTP code with a non internal format
     */
    protected abstract get interceptedHttpCodes(): Record<string, TErrorMessage>;
    /**
     * error codes like 'UNAUTHORIZED'
     * and a related internal error to throw in case we intercept
     * this given error code with a non internal format
     */
    protected abstract get interceptedErrorCodes(): Record<string, TErrorMessage>;
    /**
     * we intercept an unknown unrelatable error
     * what to throw to the end user?
     * some sort of a generalistic error of the stack
     */
    protected abstract get defaultInterceptedError(): TErrorMessage;
}
