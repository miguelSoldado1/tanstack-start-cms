import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    BACKBLAZE_APPLICATION_KEY_ID: z.string(),
    BACKBLAZE_APPLICATION_KEY: z.string(),
    BACKBLAZE_BUCKET_NAME: z.string(),
    BACKBLAZE_REGION: z.string(),
  },
  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: process.env,
});
