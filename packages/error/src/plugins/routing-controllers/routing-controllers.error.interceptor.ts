import { ErrorInterceptor, TErrorMessage } from '#pkg/index.js';
import {
    ERROR_CODE_INTERCEPT_LIBRARY,
    CODE_INTERCEPT_DEFAULT,
    HTTP_CODE_INTERCEPT_LIBRARY,
} from './routing-controllers.error.constants.js';

export class RoutingControllersExternalErrorInterceptor extends ErrorInterceptor {
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
