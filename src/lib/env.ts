import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  REQUIRE_DASHBOARD_AUTH: z.enum(["true", "false"]).optional(),
  // Supabase (optional)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema> & { REQUIRE_DASHBOARD_AUTH_BOOL: boolean };

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // In runtime server contexts, we want an explicit error if env is invalid.
  // You can adjust to log-and-continue for local dev if needed.
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env: Env = {
  ...parsed.data,
  REQUIRE_DASHBOARD_AUTH_BOOL: parsed.data.REQUIRE_DASHBOARD_AUTH === "true",
};
