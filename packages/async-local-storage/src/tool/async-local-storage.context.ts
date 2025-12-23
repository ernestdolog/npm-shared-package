import { AsyncLocalStorageClient } from './async-local-storage.client.js';

export type TAlsServerContext<TAlsContext> = {
    als?: AsyncLocalStorageClient<TAlsContext>;
};
