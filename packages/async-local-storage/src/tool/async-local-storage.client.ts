import { AsyncLocalStorage } from 'node:async_hooks';

export class AsyncLocalStorageClient<TAlsContext> {
    private als: AsyncLocalStorage<TAlsContext>;

    constructor() {
        this.als = new AsyncLocalStorage<TAlsContext>();
    }

    run(partialStore: Partial<TAlsContext>, callback: () => unknown): unknown {
        const storage = this.storage;
        if (!storage) {
            return this.als.run(partialStore as TAlsContext, callback);
        } else {
            return this.als.run({ ...storage, ...partialStore }, callback);
        }
    }

    get storage(): TAlsContext | undefined {
        return this.als.getStore();
    }

    get instance(): AsyncLocalStorage<TAlsContext> {
        return this.als;
    }
}

let alsClient: AsyncLocalStorageClient<unknown>;

/**
 * Provide cached ALS. Creates new if isn't cached.
 */
export function getAsyncLocalStorage<TAlsContext>(): AsyncLocalStorageClient<TAlsContext> {
    if (!alsClient) alsClient = new AsyncLocalStorageClient<TAlsContext>();
    return alsClient as AsyncLocalStorageClient<TAlsContext>;
}
