import { CommonError, ErrorFormattedMessage } from '#pkg/error/index.js';
import { ApolloServerError } from '#pkg/plugins/apollo-server/index.js';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';

describe('ApolloServerError', { concurrency: true }, () => {
    it('error signature matches', async () => {
        const thrownProperties = {
            resource: 'SomeDataAccessObject',
        };
        const thrownError = new ApolloServerError(CommonError.NOT_FOUND, thrownProperties);

        const callThrow = async (): Promise<unknown> => {
            throw thrownError;
        };

        await assert.rejects(callThrow, (receivedError: ApolloServerError) => {
            const formattedErrorMessage = new ErrorFormattedMessage({
                message: CommonError.NOT_FOUND.message,
                properties: thrownProperties,
            });

            assert.equal(receivedError.type, 'InternalServerError');
            assert.equal(receivedError.name, CommonError.NOT_FOUND.name);
            assert.equal(receivedError.message, formattedErrorMessage.text);
            assert.equal(receivedError.httpCode, CommonError.NOT_FOUND.httpCode);
            assert.deepEqual(receivedError.properties, thrownProperties);
            return true;
        });
    });
});
