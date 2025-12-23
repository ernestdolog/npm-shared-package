import { CommonError, ErrorFormattedMessage } from '#pkg/error/index.js';
import { RoutingControllersError } from '#pkg/plugins/routing-controllers/routing-controllers.error.js';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';

describe('RoutingControllersError', { concurrency: true }, () => {
    it('error signature matches', async () => {
        const thrownProperties = {
            resource: 'SomeDataAccessObject',
        };
        const thrownError = new RoutingControllersError(CommonError.NOT_FOUND, thrownProperties);

        const callThrow = async (): Promise<unknown> => {
            throw thrownError;
        };

        await assert.rejects(callThrow, (receivedError: unknown) => {
            const formattedErrorMessage = new ErrorFormattedMessage({
                message: CommonError.NOT_FOUND.message,
                properties: thrownProperties,
            });

            assert.equal((receivedError as any).type, 'InternalServerError');
            assert.equal((receivedError as any).name, CommonError.NOT_FOUND.name);
            assert.equal((receivedError as any).message, formattedErrorMessage.text);
            assert.equal((receivedError as any).httpCode, CommonError.NOT_FOUND.httpCode);
            assert.deepEqual((receivedError as any).properties, thrownProperties);
            return true;
        });
    });
});
