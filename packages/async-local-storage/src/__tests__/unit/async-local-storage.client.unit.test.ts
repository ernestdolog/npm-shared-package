import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { it, describe } from 'node:test';
import { getAsyncLocalStorage } from '#pkg/tool/async-local-storage.client.js';
import { AsyncLocalStorage } from 'node:async_hooks';

describe('AsyncLocalStorageClient', { concurrency: true }, () => {
    it('local storage returns instance of node als', async () => {
        const als = getAsyncLocalStorage();
        assert.equal(true, als.instance instanceof AsyncLocalStorage);
    });

    it('local storage singleton returns the same instance', async () => {
        const als1 = getAsyncLocalStorage();

        const als2 = getAsyncLocalStorage();

        assert.equal(als1, als2);
    });

    it('local storage content available on callback', async () => {
        type TAlsContext = {
            foo: string;
        };
        const foo = faker.string.alphanumeric('10');

        const als = getAsyncLocalStorage<TAlsContext>();

        const callbackFunction = () => {
            assert.equal(als.storage?.foo, foo);
        };

        await als.run({ foo }, callbackFunction);
    });
});
