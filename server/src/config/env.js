require("dotenv").config();

const { z } = require("zod");

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    CLIENT_URL: z.string().url().optional(),
    CORS_ORIGINS: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(250),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.API_KEY || data.API_KEY.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["API_KEY"],
          message: "API_KEY must be set in production and be at least 32 characters",
        });
      }
      if (!data.CLIENT_URL && !data.CORS_ORIGINS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CLIENT_URL"],
          message: "Set CLIENT_URL or CORS_ORIGINS in production",
        });
      }
      if (!data.OPENAI_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OPENAI_API_KEY"],
          message: "OPENAI_API_KEY must be set in production",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${formatted}`);
}

const rawEnv = parsed.data;

const corsOrigins = rawEnv.CORS_ORIGINS
  ? rawEnv.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : rawEnv.CLIENT_URL
  ? [rawEnv.CLIENT_URL]
  : [];

const env = {
  ...rawEnv,
  CORS_ORIGINS: corsOrigins,
};

module.exports = { env };