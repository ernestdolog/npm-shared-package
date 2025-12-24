/**
 * The Global Test Runner
 * ======================
 * Provides global test setup.
 *
 * Because of node test runners concurrency this is elemental.
 */
import './framework.setup.js';
import { run } from 'node:test';
import process from 'node:process';
import { tap } from 'node:test/reporters';

const stream = run({
    files: [
        './src/__tests__/e2e/fastify.authorization.e2e.test.ts',
        './src/__tests__/e2e/apollo-server.authorization.e2e.test.ts',
    ],
    concurrency: false,
}).compose(tap);

stream.pipe(process.stdout);
