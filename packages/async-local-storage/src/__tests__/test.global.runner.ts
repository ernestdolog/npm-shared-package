/**
 * The Global Test Runner
 * ======================
 * Provides global test setup.
 *
 * Because of node test runners concurrency this is elemental.
 *
 * TODO:
 * - figure some test suite recognition @see https://github.com/nodejs/node/issues/49732
 * - figure how to run only test suites with this global, and not the global as a suite
 */
import './framework.setup.js';
import { run } from 'node:test';
import process from 'node:process';
import { tap } from 'node:test/reporters';

const stream = run({
    files: ['./src/__tests__/unit/async-local-storage.client.unit.test.ts'],
    /**
     * As after integration, and e2e tests we truncate databases
     * This should not happen paralelly, unless we figure a way to only delete the data added at that test with a one-liner
     * Switch on concurrency locally for unit tests and such
     */
    concurrency: false,
}).compose(tap);

stream.pipe(process.stdout);
