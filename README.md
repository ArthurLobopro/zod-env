# Zod Env

A TypeScript library for loading and validating environment variables using [Zod](https://zod.dev/), providing strong and safe type validation for environment configurations.

## Installation

```bash
npm install @arthur-lobo/zod-env
```

## Description

`ZodEnv` allows you to define Zod schemas to validate environment variables, ensuring their values are in the correct format and providing default values when necessary. It supports both synchronous and asynchronous operations, and allow you to define how `.env` must be loaded.

## Basic Usage

### Synchronous Class: `ZodEnv`

```typescript
import { z } from 'zod';
import { ZodEnv } from '@arthur-lobo/zod-env';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  DEBUG: z.coerce.boolean().default(false),
});

const env = new ZodEnv({
  schema,
  getEnv: () => process.env, // or any function that returns an object with the variables like `import.meta.env` when using vite to build your frontend
});

// Access validated values
console.log(env.get('PORT')); // 3000 (or the value of process.env.PORT if defined)
console.log(env.get('DATABASE_URL')); // validated string
```

### Asynchronous Class: `AsyncZodEnv`

```typescript
import { z } from 'zod';
import { AsyncZodEnv } from '@arthur-lobo/zod-env';

const schema = z.object({
  API_KEY: z.string(),
  TIMEOUT: z.coerce.number().default(5000),
});

const env = new AsyncZodEnv({
  schema,
  getEnv: async () => {
    await someAsyncOperation();
    return process.env;
  },
});

// Access validated values asynchronously
const apiKey = await env.get('API_KEY');
const timeout = await env.get('TIMEOUT');
```

### Loading .env File

You can automatically load a `.env` file using Node.js's `loadEnv` function:

```typescript
import { loadEnvFile } from 'node:process';

const env = new ZodEnv({
  schema: z.object({
    SECRET_KEY: z.string(),
  }),
  loadEnv: loadEnvFile, // Loads the .env file
  getEnv: () => process.env,
});

console.log(env.get('SECRET_KEY')); // Validated value from .env
```

For asynchronous operations:

```typescript
const env = new AsyncZodEnv({
  schema: z.object({
    SECRET_KEY: z.string(),
  }),
  loadEnv: async () => loadEnvFile(), // Loads .env asynchronously
  getEnv: async () => process.env,
});
```

## Schema Examples

```typescript
import { z } from 'zod';

// Basic schema with default values
const basicSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  DEBUG: z.coerce.boolean().default(false),
});

// Schema with custom validations
const advancedSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  MAX_CONNECTIONS: z.coerce.number().min(1).max(100),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',')).pipe(z.array(z.string().url())),
});
```

## Benefits

- **Strong Type Validation**: Uses Zod to ensure environment variables are in the correct format.
- **Default Values**: Native support for default values in the Zod schema.
- **Flexibility**: Works with any source of environment variables (process.env, import.meta.env, custom files, etc.).
- **.env Support**: Easy integration with `.env` files via Node.js's `loadEnvFile`.
- **Async/Sync**: Choose between synchronous or asynchronous operations as needed.
- **TypeScript**: Fully typed, providing autocomplete and type checking.
