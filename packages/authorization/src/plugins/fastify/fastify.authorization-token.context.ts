import { FastifyRequest } from 'fastify';
import { AUTHORIZATION_TOKEN_HEADER, TAuthorizationContext } from '../../tool/index.js';
import { requestContext } from '@fastify/request-context';

const computeAuthorizationToken = (request: FastifyRequest): string | string[] | undefined => {
    return request.headers[AUTHORIZATION_TOKEN_HEADER];
};

export const AuthorizationTokenContext = (request: FastifyRequest): TAuthorizationContext => ({
    authorizationToken: computeAuthorizationToken(request),
});

export const getAuthorizationToken = (): string | string[] | null | undefined => {
    return requestContext.get('authorizationToken');
};
