import { ZodObject, z } from "zod";

interface ZodEnvConstructor {
  schema: ZodObject;
  loadEnv?: () => void;
  getEnv: () => Record<string, any>;
}

export class ZodEnv<S extends ZodObject> {
  schema: S;
  env: z.infer<S>;


  constructor({ schema, loadEnv, getEnv }: ZodEnvConstructor & { schema: S; }) {
    this.schema = schema;

    loadEnv?.();

    this.env = schema.parse(getEnv());
  }

  get<K extends keyof S["shape"]>(key: K) {
    return this.env[key];
  }
}

interface AsyncZodEnvConstructor {
  schema: ZodObject;
  loadEnv?: () => Promise<void>;
  getEnv: () => Promise<Record<string, any>>;
}

export class AsyncZodEnv<S extends ZodObject> {
  schema: S;
  env: Promise<z.infer<S>>;

  constructor({ schema, loadEnv, getEnv }: AsyncZodEnvConstructor & { schema: S; }) {
    this.schema = schema;

    if (typeof loadEnv === "function") {
      this.env = loadEnv().then(getEnv).then(result => schema.parse(result));
    } else {
      this.env = getEnv().then(result => schema.parse(result));
    }
  }

  async get<K extends keyof S["shape"]>(key: K) {
    return (await this.env)[key];
  }
}