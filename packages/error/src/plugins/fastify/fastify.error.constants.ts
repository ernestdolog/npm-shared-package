import { CommonError, TErrorMessage } from '#pkg/index.js';

export const HTTP_CODE_INTERCEPT_LIBRARY: Record<string, TErrorMessage> = {
    '401': CommonError.UNAUTHORIZED,
    '403': CommonError.FORBIDDEN,
    '404': CommonError.NOT_FOUND,
    '500': CommonError.INTERNAL_SERVER_ERROR,
} as const;

export const ERROR_CODE_INTERCEPT_LIBRARY: Record<string, TErrorMessage> = {
    UNAUTHENTICATED: CommonError.UNAUTHORIZED,
} as const;

export const CODE_INTERCEPT_DEFAULT = CommonError.INTERNAL_SERVER_ERROR;
