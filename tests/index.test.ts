import { describe, expect, it } from "vitest";

import { loadEnvFile } from "node:process";
import { z } from "zod";
import { AsyncZodEnv, ZodEnv } from "../src";


const firstSchema = z.object({
    foo: z.string().length(3),
    bar: z.coerce.number()
});

const schemaWithDefaults = z.object({
    foo: z.string().length(3).default("bar"),
    bar: z.coerce.number().default(3),
});

const envFileSchema = z.object({
    SUPERSECRET_WORD: z.string()
});

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe("Sync Tests", () => {
    it("Should Parse and Return Env", () => {
        const env = new ZodEnv({
            schema: firstSchema,
            getEnv: () => ({ foo: "bar", bar: 7 })
        });

        expect(env.get("foo")).toBe("bar");
        expect(env.get("bar")).toBe(7);
    });

    it("Should fill with default values", () => {
        const env = new ZodEnv({
            schema: schemaWithDefaults,
            getEnv: () => ({})
        });

        expect(env.get("foo")).toBe("bar");
        expect(env.get("bar")).toBe(3);
    });

    it("Should load .env file", () => {
        const env = new ZodEnv({
            schema: envFileSchema,
            loadEnv: loadEnvFile,
            getEnv: () => process.env
        });

        expect(env.get("SUPERSECRET_WORD")).toBe("catapimbas");
    });
});

describe("Async Tests", () => {
    it("Should Parse and Return Env", async () => {
        const env = new AsyncZodEnv({
            schema: firstSchema,
            getEnv: () => delay(100).then(() => ({ foo: "bar", bar: 7 }))
        });

        expect(await env.get("foo")).toBe("bar");
        expect(await env.get("bar")).toBe(7);
    });

    it("Should fill with default values", async () => {
        const env = new AsyncZodEnv({
            schema: schemaWithDefaults,
            getEnv: () => delay(100).then(() => ({}))
        });

        expect(await env.get("foo")).toBe("bar");
        expect(await env.get("bar")).toBe(3);
    });

    it("Should load .env file", async () => {
        const env = new AsyncZodEnv({
            schema: envFileSchema,
            loadEnv: async () => loadEnvFile(),
            getEnv: () => delay(100).then(() => process.env)
        });

        expect(await env.get("SUPERSECRET_WORD")).toBe("catapimbas");
    });

    it("Should call getEnv only after loadEnv resolves", async () => {
        const calls: string[] = [];

        const env = new AsyncZodEnv({
            schema: firstSchema,
            loadEnv: async () => {
                calls.push("loadEnv:start");
                await delay(100);
                calls.push("loadEnv:end");
            },
            getEnv: async () => {
                calls.push("getEnv");
                return { foo: "bar", bar: 7 };
            }
        });

        await env.env;

        expect(calls).toEqual(["loadEnv:start", "loadEnv:end", "getEnv"]);
    });

    it("Should see variables set by loadEnv", async () => {
        const source: Record<string, string> = {};

        const env = new AsyncZodEnv({
            schema: firstSchema,
            loadEnv: () => delay(100).then(() => {
                source.foo = "baz";
                source.bar = "42";
            }),
            getEnv: async () => ({ ...source })
        });

        expect(await env.get("foo")).toBe("baz");
        expect(await env.get("bar")).toBe(42);
    });

    it("Should not call getEnv when loadEnv rejects", async () => {
        let getEnvCalled = false;

        const env = new AsyncZodEnv({
            schema: firstSchema,
            loadEnv: () => delay(100).then(() => { throw new Error("load failed"); }),
            getEnv: async () => {
                getEnvCalled = true;
                return { foo: "bar", bar: 7 };
            }
        });

        await expect(env.env).rejects.toThrow("load failed");
        expect(getEnvCalled).toBe(false);
    });
});