import { TAlsServerContext, getAsyncLocalStorage } from '@ernestdolog/async-local-storage';
import { BaseContext, Next } from 'koa';

/**
 * Places Als singleton instance at the context
 * To be called as early as possible from middlewares
 * @param {BaseContext & TAlsServerContext<TAlsContext>} ctx
 * @param {Next} next
 */
export const KoaServerAlsMiddleware = async <TAlsContext>(
    ctx: BaseContext & TAlsServerContext<TAlsContext>,
    next: Next,
): Promise<void> => {
    ctx.als = getAsyncLocalStorage<TAlsContext>();
    await ctx.als.run(ctx.als.storage || {}, next);
};
