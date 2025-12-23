import { TErrorMessage } from '#pkg/index.js';
import { ErrorInterceptor } from '../../error/error.interceptor.js';
import {
    ERROR_CODE_INTERCEPT_LIBRARY,
    CODE_INTERCEPT_DEFAULT,
    HTTP_CODE_INTERCEPT_LIBRARY,
} from './fastify.error.constants.js';

export class FastifyExternalErrorInterceptor extends ErrorInterceptor {
    constructor(error: unknown) {
        super(error);
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
