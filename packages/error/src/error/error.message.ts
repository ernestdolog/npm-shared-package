export abstract class ErrorMessage {}

export class CommonError extends ErrorMessage {
    static UNAUTHORIZED = {
        httpCode: 401,
        name: 'UNAUTHORIZED',
        message: 'Requires authorization.',
    };
    static FORBIDDEN = {
        httpCode: 403,
        name: 'FORBIDDEN',
        message: 'User not permitted to perform action.',
    };
    static NOT_FOUND = {
        httpCode: 404,
        name: 'NOT_FOUND',
        message: ':resource not found',
    };
    static INTERNAL_SERVER_ERROR = {
        httpCode: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
    };
    static CONFLICT = {
        httpCode: 409,
        name: 'CONFLICT',
        message: 'Resource conflicts',
    };
}
