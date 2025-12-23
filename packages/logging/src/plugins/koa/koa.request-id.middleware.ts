import { TAlsServerContext } from '@ernestdolog/async-local-storage';
import { REQUEST_ID_HEADER, RequestId } from '#pkg/request-id/index.js';
import { BaseContext, Next } from 'koa';
import { TRequestIdContext } from '#pkg/request-id/request-id.types.js';

/**
 * If requestId isn't in the header, generates one
 * Places in ALS
 * @param {BaseContext & TAlsContext<TContext>} ctx
 * @param {Next} next
 */
export const KoaServerRequestIdMiddleware = async <TContext extends TRequestIdContext>(
    ctx: BaseContext & TAlsServerContext<TContext>,
    next: Next,
): Promise<void> => {
    let requestId = ctx.get(REQUEST_ID_HEADER);
    if (!requestId) {
        requestId = new RequestId().value;
    }

    const storage = ctx.als?.storage || ({} as TContext);
    storage.requestId = requestId;

    await ctx.als!.run(storage, next);
};
