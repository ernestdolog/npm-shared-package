import { getAsyncLocalStorage } from '@ernestdolog/async-local-storage';
import { randomUUID } from 'node:crypto';
import { TRequestIdContext } from './request-id.types.js';

/**
 * This class is responsible for generating a new request id.
 */
export class RequestId {
    private requestId = '';

    constructor(inputRequestId?: string | null) {
        this.setRequestId(inputRequestId);
    }
    /**
     * Generated id within the instance.
     */
    get value(): string {
        return this.requestId;
    }

    private setRequestId(inputRequestId?: string | null) {
        this.requestId = inputRequestId ?? randomUUID();
    }
}

/**
 * @returns {string} when store found in the context
 * @returns {undefined} when store is not found execution happens on the main thread.
 * is not used with `useAsyncLocalStorage`.
 */
export function getRequestId<TAlsContext extends TRequestIdContext = TRequestIdContext>():
    | string
    | undefined {
    const storage = getAsyncLocalStorage<TAlsContext>().storage;
    return storage?.requestId;
}
