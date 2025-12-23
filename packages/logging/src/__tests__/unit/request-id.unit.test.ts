import { RequestId } from '#pkg/index.js';
import { getLogger } from '#pkg/tool/index.js';
import { TRequestIdContext } from '#pkg/request-id/request-id.types.js';
import { faker } from '@faker-js/faker';
import { getAsyncLocalStorage } from '@ernestdolog/async-local-storage';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';

describe('RequestId', { concurrency: true }, () => {
    it('request id consistent through callback process', async t => {
        // @ts-ignore
        const ets = t.mock.method(console._stdout, 'write');

        const requestId = new RequestId().value;
        const als = getAsyncLocalStorage<TRequestIdContext>();

        await als.run({ requestId }, () => {
            /**
             * First log
             */
            const l = getLogger().child({ fn: 'callerName', ctx: { foo: 'bar' } });

            l.info(faker.internet.email());

            const callOne = ets.mock.calls[0];

            assert.equal(JSON.parse(callOne.arguments[0]).requestId, requestId);
            /**
             * Second log
             */
            l.info(faker.internet.email());

            const callTwo = ets.mock.calls[1];

            assert.equal(JSON.parse(callTwo.arguments[0]).requestId, requestId);
        });
    });
});
