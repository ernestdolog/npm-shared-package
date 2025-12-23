import { ParameterizedContext, Next } from 'koa';
import { getLogger } from '@ernestdolog/logging';
import { RoutingControllersError } from '../routing-controllers.error.js';
import { RoutingControllersExternalErrorInterceptor } from '../routing-controllers.error.interceptor.js';

/**
 * Return JSON
 * If thrown error isnt implemented explicitly
 * Return 500 internal
 * @param {ParameterizedContext} ctx
 * @param {Next} next
 */
export const KoaErrorMiddleware = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    try {
        await next();
    } catch (error: unknown) {
        const l = getLogger();
        const isInternal = RoutingControllersExternalErrorInterceptor.isInternal(error);
        if (isInternal) {
            l.child({
                cls: 'KoaErrorMiddleware',
                ctx: error,
            }).error('internal server error caught');
            ctx.status = (error as RoutingControllersError).httpCode;
            ctx.body = error;
        } else {
            const externalError = new RoutingControllersExternalErrorInterceptor(error);
            const internalServerError = new RoutingControllersError(externalError.internalError, {
                message: externalError.messagified,
            });
            l.child({
                cls: 'KoaErrorMiddleware',
                ctx: internalServerError,
            }).error('external 3rd party error caught');
            ctx.status = internalServerError.httpCode;
            ctx.body = internalServerError;
        }
    }
};
