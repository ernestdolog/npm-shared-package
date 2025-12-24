# Project Instructions

## Hooks

**Hooks execution is mandatory, not optional.**
**Following Hooks only valid and to be executed inside npm-shared-package.**

### Once at the end of prompt execution if WRITE Code Changes happened

- Always use `post-prompt-finetune` skill to validate.

## Architecture

**Pattern:** Plugin Architecture (Hexagonal/Ports & Adapters)

This is a reusable utilities monorepo with pluggable framework adapters.

### Structure

```
packages/{package}/
├── tool/              # Core contracts (framework-agnostic)
│   ├── *.types.ts     # Interfaces/contracts (ports)
│   ├── *.entity.ts    # Data carriers
│   ├── *.error.ts     # Error definitions
│   ├── *.constants.ts # Constants
│   └── index.ts       # Barrel exports
└── plugins/           # Framework adapters
    ├── fastify/       # Fastify-specific adapter
    ├── koa/           # Koa-specific adapter
    └── apollo-server/ # Apollo-specific adapter
```

### Principles

1. **tool/ = Framework-agnostic core**
    - No framework imports
    - Pure TypeScript
    - Defines contracts (ports)
    - Contains core logic

2. **plugins/ = Framework-specific adapters**
    - Implement tool/ contracts
    - Handle framework specifics
    - Each plugin is independent

3. **Dependency direction**

```
   plugins/ ──depends on──> tool/
```

Never the reverse.

4. **Exports**
    - Main package exports tool/
    - Plugins export via subpaths (e.g., `@pkg/fastify`)
    - Only export what's necessary for consumers

## Stack

- TypeScript ESM (use `.js` in imports)
- Node.js >= 20
- Strict mode
- Plugin architecture

## Code Style

- small files with exact name about what they contain (`user.entity.ts` not `entities.ts`)
- prefer many small units over some large units
- manage exports carefully, only export outside what is needed
- invest in proper naming
- write code which reads in english
- prefer explicit over implicit

```

```
