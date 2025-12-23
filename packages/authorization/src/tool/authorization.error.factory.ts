import type { TErrorMessage } from '@ernestdolog/error';

/**
 * Factory function type for creating throwable errors from error messages.
 * This allows the consumer to provide their own error class implementation.
 */
export type TErrorFactory = (errorMessage: TErrorMessage) => Error;

/**
 * Default error factory that creates a basic Error with the message.
 * Used when no custom error factory is provided.
 */
export const defaultErrorFactory: TErrorFactory = (errorMessage: TErrorMessage): Error => {
    const error = new Error(errorMessage.message);
    error.name = errorMessage.name;
    return error;
};
