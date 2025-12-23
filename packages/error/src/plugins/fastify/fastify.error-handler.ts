import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { FastifyInternalError } from './fastify.error.js';
import { FastifyExternalErrorInterceptor } from './fastify.error.interceptor.js';
import { getLogger } from '@ernestdolog/logging';
/**
 * Return JSON
 * If thrown error isnt implemented explicitly
 * Return 500 internal
 * @param {FastifyError} error
 */
export const ErrorHandler = async (
    error: FastifyError,
    _: FastifyRequest,
    reply: FastifyReply,
): Promise<void> => {
    const l = getLogger();
    const isInternal = FastifyExternalErrorInterceptor.isInternal(error);
    if (isInternal) {
        l.child({
            cls: 'ErrorHandler',
            ctx: error,
        }).error('server error caught');
        reply.status(Number(error.code)).send(JSON.parse(JSON.stringify(error)));
    } else {
        const externalError = new FastifyExternalErrorInterceptor(error);
        const internalServerError = new FastifyInternalError(externalError.internalError, {
            message: externalError.messagified,
        });
        l.child({
            cls: 'ErrorHandler',
            ctx: { error, internalServerError },
        }).error('3rd party error caught');
        reply
            .status(Number(internalServerError.code))
            .send(JSON.parse(JSON.stringify(internalServerError)));
    }
};
