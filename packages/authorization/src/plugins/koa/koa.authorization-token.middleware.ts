import { AUTHORIZATION_TOKEN_HEADER, TAuthorizationContext } from '../../tool/index.js';
import { TAlsServerContext } from '@ernestdolog/async-local-storage';
import { BaseContext, Next } from 'koa';

/**
 * Middleware to place authorization token in AsyncLocalStorage.
 * Lack of authorization header indicates public API endpoints.
 */
export async function KoaAuthorizationTokenMiddleware<TContext extends TAuthorizationContext>(
    ctx: BaseContext & TAlsServerContext<TContext>,
    next: Next,
): Promise<void> {
    const authorizationToken = ctx.get(AUTHORIZATION_TOKEN_HEADER);

    const storage = ctx.als?.storage || ({} as TContext);
    storage.authorizationToken = authorizationToken;

    await ctx.als!.run(storage, next);
}
