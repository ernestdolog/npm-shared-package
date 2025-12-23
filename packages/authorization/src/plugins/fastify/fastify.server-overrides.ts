import { TAuthorizationContext, User } from '../../tool/index.js';

/**
 * @since Fastify uses legacy module structure
 * We must ensure the request context here.
 * This might be disturbing while using it together with other tools.
 *
 * This file and its content is only here "to make comiler happy".
 */
declare module 'fastify' {
    interface FastifyRequest {
        user?: User;
    }
}

declare module '@fastify/request-context' {
    interface RequestContextData extends TAuthorizationContext {}
}
