import { describe, expect, it } from "vitest";

import { loadEnvFile } from "node:process";
import { z } from "zod";
import { ZodEnv } from "../src";


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

describe("Test Env", () => {
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