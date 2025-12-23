<h1 align="center">
  Error
</h1>

-   [Installation](#installation)
-   [Usage](#usage)
-   [Version](#version)

Common error library package.

## Installation

> When the package is private and lives on GitHub

Create a personal access token at Github

> Make sure to have the rights checked for: read:packages and write:packages

Login to npm with the following:

```shell
$ npm login --registry=https://npm.pkg.github.com
```

> Enter your username, access token (as password) and e-mail

Check if the .npmrc file is added to the project. Otherwise add .npmrc with: `@ernestdolog:registry=https://npm.pkg.github.com/ernestdolog`

If all set up, use:

```shell
npm i @ernestdolog/error
```

## Usage

Coming soon...

<h1 align="center">
  Error
</h1>

---

## Table of Contents

-   [About](#about)
-   [Concepts](#concepts)
-   [Installation](#installation)
-   [Defining Errors](#defining-errors)
-   [Throwing Errors](#throwing-errors)
-   [Framework Integrations](#framework-integrations)
    -   [Apollo Server](#apollo-server)
    -   [Fastify](#fastify)
    -   [routing-controllers (Express / Koa)](#routing-controllers-express--koa)

---

## About

The **Error** package provides a unified, strongly typed error model that can be reused across multiple server frameworks.

It allows you to:

-   Define domain and business errors once
-   Format error messages using named placeholders
-   Convert errors automatically to framework-specific responses
-   Integrate cleanly with request tracing and logging

This package is designed to work seamlessly with  
**@ernestdolog/logging** and **@ernestdolog/async-local-storage**.

---

## Concepts

### Error Definition

Errors are defined as **static descriptors** and reused across the application.

Each error descriptor contains:

| Field    | Description                       |
| -------- | --------------------------------- |
| httpCode | HTTP status code                  |
| name     | Machine-readable error identifier |
| message  | Human-readable message template   |

Message templates support **named placeholders**:

```text
:placeholderName
```

At runtime, placeholders are replaced using a properties object.

## Installation

```bash
npm i @ernestdolog/error
```

# Error Handling with `@ernestdolog/error`

## Peer Dependencies

Install only the frameworks you use:

-   `@apollo/server`
-   `fastify`
-   `routing-controllers`
-   `koa`

---

## Defining Errors

Create your own error classes by extending `ErrorMessage`.

💡 It is recommended to create many small error classes per domain, model, or bounded context.

```ts
import { ErrorMessage } from '@ernestdolog/error';

export class BodyParseError extends ErrorMessage {
    static REQUEST_BODY_PARSE_ERROR = {
        httpCode: 400,
        name: 'BODY_PARSE_ERROR',
        message: 'Request body invalid.',
    };

    static OTHER_EXAMPLE_PARSE_ERROR = {
        httpCode: 400,
        name: 'OTHER_EXAMPLE_PARSE_ERROR',
        message: ':target is invalid.',
    };
}
```

# Throwing Errors

Errors are thrown using framework-specific wrappers.

Each wrapper accepts:

-   An error descriptor
-   Optional placeholder properties

---

## Framework Integrations

### Apollo Server

#### Throwing an Apollo Error

```ts
import { ApolloServerError } from '@ernestdolog/error/apollo-server';
import { BodyParseError } from './body-parse.error';

throw new ApolloServerError(BodyParseError.OTHER_EXAMPLE_PARSE_ERROR, {
    target: 'The example',
});
```

# Error Handling: Framework Integrations

---

## Apollo Server

### Registering the Apollo Error Plugin

⚠️ Plugin order matters. `ApolloServerErrorPlugin` must be registered last.

```ts
import { ApolloServerErrorPlugin } from '@ernestdolog/error/apollo-server';

const apolloServer = new ApolloServer({
    schema: subgraphSchema,
    plugins: [
        new ApolloServerAlsPlugin(),
        ApolloServerPluginInlineTraceDisabled(),
        new ApolloServerRequestIdPlugin(),
        new ApolloServerAuthorizationTokenPlugin(),
        new ApolloServerErrorPlugin(), // MUST be last
    ],
    introspection: this.appConfig.isIntrospection,
    csrfPrevention: false,
});

await apolloServer.start();
```

# Fastify and Routing-Controllers Error Handling

---

## Fastify

### Throwing a Fastify Error

```ts
import { FastifyInternalError } from '@ernestdolog/error/fastify';
import { BodyParseError } from './body-parse.error';

throw new FastifyInternalError(BodyParseError.REQUEST_BODY_PARSE_ERROR);

// With placeholders:
throw new FastifyInternalError(BodyParseError.OTHER_EXAMPLE_PARSE_ERROR, { target: 'email' });
```

# Fastify and Routing-Controllers Error Handling

---

## Fastify

### Registering the Fastify Error Handler

⚠️ Must be registered immediately after Fastify initialization.

```ts
import Fastify from 'fastify';
import { ErrorHandler } from '@ernestdolog/error/fastify';
import fastifyRequestContext from '@fastify/request-context';

const app = Fastify({ logger: false });

app.setErrorHandler(ErrorHandler);

app.register(fastifyRequestContext, {
    defaultStoreValues: request => ({
        ...AuthorizationTokenContext(request),
        ...RequestIdContext(request),
    }),
});
```

# Routing-Controllers (Express / Koa) Error Handling

`RoutingControllersError` integrates with the `routing-controllers` package and works for both Express and Koa.

---

## Throwing a Routing-Controllers Error

```ts
import { RoutingControllersError } from '@ernestdolog/error/routing-controllers';
import { BodyParseError } from './body-parse.error';

throw new RoutingControllersError(BodyParseError.OTHER_EXAMPLE_PARSE_ERROR, { target: 'username' });
```

# Registering Koa Middleware

⚠️ `KoaErrorMiddleware` must be registered last.

```ts
import Koa from 'koa';
import { KoaErrorMiddleware } from '@ernestdolog/error/routing-controllers/koa';

const app = new Koa<DefaultState, ApplicationContext>();

app.use(KoaServerAlsMiddleware);
app.use(KoaServerRequestIdMiddleware);
app.use(KoaAuthorizationTokenMiddleware);
app.use(cors());
app.use(helmet());
app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }));

app.use(KoaErrorMiddleware); // MUST be last

useKoaServer(app, {
    controllers: [
        HealthController,
        // ...all other controllers
    ] as never[],
    defaultErrorHandler: false,
});
```

## Summary

-   Define errors once
-   Reuse across multiple frameworks
-   Strong typing and message templating
-   Clean integration with logging and request context

This package ensures consistent, maintainable, and production-ready error handling.
