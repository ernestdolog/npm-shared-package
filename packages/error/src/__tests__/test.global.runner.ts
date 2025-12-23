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
    files: [
        './src/__tests__/unit/routing-controllers.error.unit.test.ts',
        './src/__tests__/unit/apollo-server.error.unit.test.ts',
        './src/__tests__/unit/fastify.error.unit.test.ts',
    ],
    concurrency: true,
}).compose(tap);

stream.pipe(process.stdout);
