<h1 align="center">
  Logging
</h1>

---

## Table of Contents

-   [About](#about)
-   [Concepts](#concepts)
-   [Installation](#installation)
-   [Peer Dependencies](#peer-dependencies)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [Logger](#logger)
    -   [Request ID](#request-id)
    -   [Framework Integrations](#framework-integrations)
        -   [Koa](#koa)
        -   [Apollo Server](#apollo-server)
        -   [Fastify](#fastify)

---

## About

The **Logging** package provides a production-ready logging solution with request tracing for Node.js applications.

It allows you to:

-   Use a pre-configured pino logger with automatic field redaction
-   Generate and propagate request IDs across services
-   Automatically include request IDs in all log entries
-   Integrate with Koa, Apollo Server, and Fastify

This package is designed to work with **@ernestdolog/async-local-storage**.

---

## Concepts

### Logger

The package provides a singleton pino logger with:

-   Automatic request ID injection from AsyncLocalStorage
-   Sensitive field redaction (passwords, tokens, etc.)
-   Child logger support for adding context

### Request ID

Request IDs enable distributed tracing:

-   Extracted from incoming `x-request-id` header
-   Generated automatically if not present
-   Stored in AsyncLocalStorage for access anywhere
-   Included in all log entries automatically

---

## Installation

```bash
npm i @ernestdolog/async-local-storage @ernestdolog/logging
```

---

## Peer Dependencies

The package requires:

-   `pino` — logging library

Install only the frameworks you use:

-   `koa` — for Koa middleware
-   `@apollo/server` — for Apollo Server plugin
-   `fastify` — for Fastify integration
-   `@fastify/request-context` — for Fastify request context

---

## Configuration

| Environment Variable | Description                                                   | Default |
| -------------------- | ------------------------------------------------------------- | ------- |
| `LOG_LEVEL`          | Log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` | `info`  |

---

## Usage

### Logger

Get the singleton logger and use it anywhere in your application:

```ts
import { getLogger } from '@ernestdolog/logging';

// Basic usage
getLogger().info('Application started');
getLogger().warn('Something might be wrong');
getLogger().error('An error occurred');

// With context
getLogger({ module: 'UserService' }).info('User created');
```

#### Using Child Loggers

Create child loggers to add consistent context across related log entries:

```ts
import { getLogger } from '@ernestdolog/logging';

export class UserService {
    createUser(input: CreateUserInput) {
        const log = this.log.child({ fn: 'createUser', input });

        log.info('Creating user');

        try {
            // ... create user
            log.info('User created successfully');
        } catch (error) {
            log.error({ error }, 'Failed to create user');
            throw error;
        }
    }

    private get log() {
        return getLogger({ cls: 'UserService' });
    }
}
```

#### Log Output

Logs automatically include the request ID when available:

```json
{
    "level": 30,
    "time": 1703123456789,
    "name": "my-app@1.0.0",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "cls": "UserService",
    "fn": "createUser",
    "msg": "Creating user"
}
```

---

### Request ID

Access the current request ID from anywhere:

```ts
import { getRequestId } from '@ernestdolog/logging';

function doSomething() {
    const requestId = getRequestId();
    console.log(`Processing request: ${requestId}`);
}
```

---

## Framework Integrations

### Koa

#### 1. Register Middlewares

Register ALS middleware first, then request ID middleware:

```ts
import Koa from 'koa';
import { KoaServerAlsMiddleware } from '@ernestdolog/async-local-storage/koa';
import { KoaServerRequestIdMiddleware } from '@ernestdolog/logging/koa';

const app = new Koa();

// ALS must be registered first
app.use(KoaServerAlsMiddleware);
app.use(KoaServerRequestIdMiddleware);
```

#### 2. Use Logger in Middleware

```ts
import { getLogger, getRequestId } from '@ernestdolog/logging';

app.use(async (ctx, next) => {
    const log = getLogger({ path: ctx.path });

    log.info('Request started');

    await next();

    log.info({ status: ctx.status }, 'Request completed');
});
```

---

### Apollo Server

#### 1. Register Plugins

```ts
import { ApolloServer } from '@apollo/server';
import { ApolloServerAlsPlugin } from '@ernestdolog/async-local-storage/apollo-server';
import { ApolloServerRequestIdPlugin } from '@ernestdolog/logging/apollo-server';

const server = new ApolloServer({
    schema,
    plugins: [
        new ApolloServerAlsPlugin(),
        new ApolloServerRequestIdPlugin(),
        // ...other plugins
    ],
});
```

#### 2. Use Logger in Resolvers

```ts
import { getLogger } from '@ernestdolog/logging';

const resolvers = {
    Query: {
        users: async () => {
            const log = getLogger({ resolver: 'users' });

            log.info('Fetching users');

            const users = await fetchUsers();

            log.info({ count: users.length }, 'Users fetched');

            return users;
        },
    },
};
```

---

### Fastify

Fastify uses `@fastify/request-context` instead of AsyncLocalStorage.

#### 1. Set Up Request Context

```ts
import Fastify from 'fastify';
import fastifyRequestContext from '@fastify/request-context';
import { RequestIdContext, getRequestId } from '@ernestdolog/logging/fastify';

const app = Fastify();

app.register(fastifyRequestContext, {
    defaultStoreValues: request => ({
        ...RequestIdContext(request),
    }),
});
```

#### 2. Use Logger in Routes

```ts
import { getLogger } from '@ernestdolog/logging';
import { getRequestId } from '@ernestdolog/logging/fastify';

app.get('/users', async (request, reply) => {
    const log = getLogger({ route: '/users' });

    log.info('Fetching users');

    // getRequestId() works with Fastify context
    const requestId = getRequestId();

    return { users: [], requestId };
});
```

---

## Summary

-   Production-ready pino logger with automatic redaction
-   Request ID generation and propagation
-   Automatic request ID injection in log entries
-   Framework integrations for Koa, Apollo Server, and Fastify
-   Clean integration with AsyncLocalStorage
