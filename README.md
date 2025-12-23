# NPM Shared Package
--------------------

This is a knowledge sharing Repository. Typescript reusable NPM packages stored in a Monorepo.

- npm packages
- ghcr.io (its all free - stored in GitHub)
- lerna (to keep up cross dependencies between packages - yes, they can depend on each other without issues)
- nx
- 4 packages which are present in each stacks in some shape or form

## Packages

> 👀👀👀 Into the `/packages` folder. Each subfolder represents a package. The whole monorepo thing is technical setup. Business logic lives inside these packages. Package json controls what you export and how, what are dependencies of the tool. Than there is `/src` for the code and `/src/__tests__` for tests.

- [async-local-storage](packages/async-local-storage/README.md) - Contains ALS client and operations
- [authorization](packages/authorization/README.md) - Contains authorization for API calls
- [error](packages/error/README.md) - Contains internal server error management
- [logging](packages/logging/README.md) - Logger wrapper and Request id plugin provider.

This is a monorepo managed by lerna. However all npm commands can be run from each individual
packages.

## Developers Objectives

**Segregation**:
- One package shall load on its own. Only load into the end user, what the end user wants. One logical unit loads together - no more and no less.
- Easily extendible plugin model. Let's say we have **Authorization**, we shall have some base model, and a way to easily create any plugins for any frameworks we might use. When the end user imports, shall be able to load the bse model in itself, without plugins, and 1-1 plugin separately. Let's not load Koa setup for Fastify users.
- We absolutely **do not install anything 3rd party into the end users project**. We communicate: this, this and that needs to be in your package.json if you intend to use this tool - we give control to the end user.

**Single Purpose**:
- One unit of code does one thing, and does it well. (How well, let's see. 🙃🙃🙃)

## Common Commands

### Run Tests

```shell
$ npx lerna run test
```

### Lint

```shell
$ npx lerna run lint
```

### Prettier

To check:

```shell
$ npx lerna run prettier
```

To fix:

```shell
$ npx lerna run prettier:fix
```
