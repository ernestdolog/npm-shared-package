<h1 align="center">
  Async Local Storage
</h1>

---

## Table of Contents

-   [About](#about)
-   [Concepts](#concepts)
-   [Installation](#installation)
-   [Peer Dependencies](#peer-dependencies)
-   [Usage](#usage)
    -   [Core API](#core-api)
    -   [Framework Integrations](#framework-integrations)
        -   [Koa](#koa)
        -   [Apollo Server](#apollo-server)

---

## About

The **Async Local Storage** package provides a simple, typed wrapper around Node.js `AsyncLocalStorage` for managing request-scoped data across your application.

It allows you to:

-   Store and retrieve data throughout the request lifecycle
-   Share context between middleware, services, and resolvers without prop drilling
-   Type your context for compile-time safety
-   Integrate with Koa and Apollo Server via plugins

This package is used as a foundation for
**@ernestdolog/logging** and **@ernestdolog/authorization**.

> Fastify has built-in request context via `@fastify/request-context`. No abstraction needed there.

---

## Concepts

### AsyncLocalStorage Client

The package provides a singleton client that wraps Node.js `AsyncLocalStorage`.

| Export                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `getAsyncLocalStorage()` | Returns the singleton ALS client                  |
| `TAlsServerContext<T>`   | Type for extending server context with ALS client |

### Client Methods

| Method     | Description                                           |
| ---------- | ----------------------------------------------------- |
| `run()`    | Executes callback within the ALS context              |
| `storage`  | Returns the current store (or `undefined` if outside) |
| `instance` | Returns the underlying `AsyncLocalStorage` instance   |

---

## Installation

```bash
npm i @ernestdolog/async-local-storage
```

---

## Peer Dependencies

Install only the frameworks you use:

-   `koa` — for Koa middleware
-   `@apollo/server` — for Apollo Server plugin

---

## Usage

### Core API

Define your context type and access the storage anywhere in your code:

```ts
import { getAsyncLocalStorage } from '@ernestdolog/async-local-storage';

type MyContext = {
    userId: string;
    requestId: string;
};

// Get the singleton client
const als = getAsyncLocalStorage<MyContext>();

// Run code within a context
als.run({ userId: '123', requestId: 'abc' }, () => {
    // Inside this callback, storage is available
    console.log(als.storage?.userId); // '123'
});

// Access storage from anywhere (during request lifecycle)
function getUser() {
    const storage = getAsyncLocalStorage<MyContext>().storage;
    return storage?.userId;
}
```

---

## Framework Integrations

### Koa

Register the middleware as early as possible so ALS is available throughout the request.

```ts
import Koa from 'koa';
import { KoaServerAlsMiddleware, TAlsServerContext } from '@ernestdolog/async-local-storage/koa';

type MyContext = {
    userId: string;
};

const app = new Koa<Koa.DefaultState, TAlsServerContext<MyContext>>();

// Register ALS middleware first
app.use(KoaServerAlsMiddleware);

// Later middleware can access ALS via ctx.als
app.use(async (ctx, next) => {
    console.log(ctx.als?.storage);
    await next();
});
```

---

### Apollo Server

Register the plugin to enable ALS for GraphQL resolvers.

```ts
import { ApolloServer } from '@apollo/server';
import { ApolloServerAlsPlugin } from '@ernestdolog/async-local-storage/apollo-server';

type MyContext = {
    userId: string;
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        new ApolloServerAlsPlugin<MyContext>(), // Register early
        // ...other plugins
    ],
});
```

Access from resolvers:

```ts
import { getAsyncLocalStorage } from '@ernestdolog/async-local-storage';

const resolvers = {
    Query: {
        me: () => {
            const storage = getAsyncLocalStorage<MyContext>().storage;
            return { id: storage?.userId };
        },
    },
};
```

---

## Summary

-   Simple typed wrapper around Node.js `AsyncLocalStorage`
-   Singleton pattern for consistent access
-   Framework plugins for Koa and Apollo Server
-   Foundation for request-scoped logging and authorization
