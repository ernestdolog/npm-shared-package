<h1 align="center">
  Authorization
</h1>

---

## Table of Contents

-   [About](#about)
-   [Concepts](#concepts)
-   [Installation](#installation)
-   [Peer Dependencies](#peer-dependencies)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [Verifying JWT Tokens](#verifying-jwt-tokens)
    -   [Framework Integrations](#framework-integrations)
        -   [Apollo Server](#apollo-server)
        -   [Koa](#koa)
        -   [Fastify](#fastify)

---

## About

The **Authorization** package provides AWS Cognito JWT verification and user authorization for Node.js applications.

It allows you to:

-   Verify AWS Cognito JWT tokens
-   Deserialize Cognito users into a typed `User` entity
-   Store authorization tokens in request context via AsyncLocalStorage
-   Protect routes and resolvers with role-based access control
-   Integrate with Apollo Server, Koa, and Fastify

This package is designed to work with **@ernestdolog/async-local-storage** and **@ernestdolog/error**.

---

## Concepts

### User Entity

The package deserializes Cognito JWT payloads into a `User` entity:

| Field            | Description                        |
| ---------------- | ---------------------------------- |
| `accountId`      | The user's account identifier      |
| `entityType`     | Type of entity (e.g., `PERSON`)    |
| `entityId`       | The entity's unique identifier     |
| `subscriptionId` | The user's subscription identifier |

### Authorization Flow

1. Extract JWT from `Authorization` header
2. Verify token with AWS Cognito
3. Deserialize payload into `User` entity
4. Store user in request context
5. Check roles on protected endpoints

---

## Installation

```bash
npm i @ernestdolog/async-local-storage @ernestdolog/error @ernestdolog/authorization
```

---

## Peer Dependencies

Install only the frameworks you use:

-   `@apollo/server` — for Apollo Server integration
-   `type-graphql` — for GraphQL decorators
-   `koa` — for Koa middleware
-   `fastify` — for Fastify integration
-   `@fastify/request-context` — for Fastify request context

---

## Configuration

The authorization client requires AWS Cognito configuration:

| Property     | Description                |
| ------------ | -------------------------- |
| `userPoolId` | Your Cognito User Pool ID  |
| `clientId`   | Your Cognito App Client ID |

---

## Usage

### Verifying JWT Tokens

Use the authorization client directly to verify tokens:

```ts
import { getAuthorizationVerifyClient, CognitoUser } from '@ernestdolog/authorization';

const client = getAuthorizationVerifyClient({
    userPoolId: 'us-east-1_xxxxx',
    clientId: 'your-client-id',
});

// Verify a JWT token
const payload = await client.verify(jwtToken);

// Deserialize into User entity
const user = new CognitoUser(payload).deserialize();

console.log(user.accountId);
console.log(user.entityType);
```

---

## Framework Integrations

### Apollo Server

#### 1. Register the Authorization Token Plugin

This plugin extracts the JWT from headers and stores it in AsyncLocalStorage.

```ts
import { ApolloServer } from '@apollo/server';
import { ApolloServerAlsPlugin } from '@ernestdolog/async-local-storage/apollo-server';
import { ApolloServerAuthorizationTokenPlugin } from '@ernestdolog/authorization/apollo-server';

const server = new ApolloServer({
    schema,
    plugins: [
        new ApolloServerAlsPlugin(),
        new ApolloServerAuthorizationTokenPlugin(),
        // ...other plugins
    ],
});
```

#### 2. Set Up Authorization Service

The service verifies tokens and provides the auth checker for type-graphql:

```ts
import { ApolloServerAuthorizationService } from '@ernestdolog/authorization/apollo-server';
import { buildSchema } from 'type-graphql';

const authService = new ApolloServerAuthorizationService({
    userPoolId: 'us-east-1_xxxxx',
    clientId: 'your-client-id',
});

const schema = await buildSchema({
    resolvers: [UserResolver],
    authChecker: authService.gqlAuthChecker,
});

// Pass user context to Apollo Server
const server = new ApolloServer({
    schema,
    context: authService.initContext,
});
```

#### 3. Use Decorators in Resolvers

```ts
import { Resolver, Query } from 'type-graphql';
import { AuthorizedUser, CurrentUser } from '@ernestdolog/authorization/apollo-server';
import { User } from '@ernestdolog/authorization';

@Resolver()
export class UserResolver {
    // Require authentication
    @AuthorizedUser()
    @Query(() => UserType)
    me(@CurrentUser() user: User) {
        return user;
    }

    // Require specific role
    @AuthorizedUser({ entityType: 'PERSON' })
    @Query(() => String)
    personOnly() {
        return 'Only persons can see this';
    }
}
```

---

### Koa

#### 1. Register Middlewares

Register ALS middleware first, then authorization middleware:

```ts
import Koa from 'koa';
import { KoaServerAlsMiddleware } from '@ernestdolog/async-local-storage/koa';
import { KoaAuthorizationTokenMiddleware } from '@ernestdolog/authorization/koa';

const app = new Koa();

// ALS must be registered first
app.use(KoaServerAlsMiddleware);
app.use(KoaAuthorizationTokenMiddleware);
```

#### 2. Access Authorization Token

```ts
import { getAsyncLocalStorage } from '@ernestdolog/async-local-storage';
import { TAuthorizationContext } from '@ernestdolog/authorization';

function getToken() {
    const storage = getAsyncLocalStorage<TAuthorizationContext>().storage;
    return storage?.authorizationToken;
}
```

#### 3. Verify and Use User

```ts
import { getAuthorizationVerifyClient, CognitoUser } from '@ernestdolog/authorization';

const authClient = getAuthorizationVerifyClient({
    userPoolId: 'us-east-1_xxxxx',
    clientId: 'your-client-id',
});

app.use(async (ctx, next) => {
    const token = ctx.als?.storage?.authorizationToken;

    if (token?.startsWith('Bearer ')) {
        const jwt = token.replace('Bearer ', '');
        const payload = await authClient.verify(jwt);
        const user = new CognitoUser(payload).deserialize();
        // Use user...
    }

    await next();
});
```

---

### Fastify

#### 1. Set Up Request Context

Fastify uses `@fastify/request-context` instead of AsyncLocalStorage:

```ts
import Fastify from 'fastify';
import fastifyRequestContext from '@fastify/request-context';
import { AuthorizationTokenContext } from '@ernestdolog/authorization/fastify';

const app = Fastify();

app.register(fastifyRequestContext, {
    defaultStoreValues: request => ({
        ...AuthorizationTokenContext(request),
    }),
});
```

#### 2. Access Authorization Token

```ts
import { getAuthorizationToken } from '@ernestdolog/authorization/fastify';

app.get('/protected', async (request, reply) => {
    const token = getAuthorizationToken();
    // Verify and use token...
});
```

---

## Error Handling

The package provides built-in errors via `@ernestdolog/error`:

| Error             | HTTP Code | Description                    |
| ----------------- | --------- | ------------------------------ |
| `UNAUTHENTICATED` | 401       | Token missing or invalid       |
| `UNAUTHORIZED`    | 403       | User lacks required permission |

Custom error factory support:

```ts
import { ApolloServerError } from '@ernestdolog/error/apollo-server';
import { getAuthorizationVerifyClient } from '@ernestdolog/authorization';

const client = getAuthorizationVerifyClient(
    { userPoolId: '...', clientId: '...' },
    error => new ApolloServerError(error), // Custom error factory
);
```

---

## Summary

-   AWS Cognito JWT verification out of the box
-   Typed `User` entity with deserialization
-   Framework integrations for Apollo Server, Koa, and Fastify
-   Role-based access control via decorators
-   Clean integration with error handling and logging packages
