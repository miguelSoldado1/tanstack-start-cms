import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, lastLoginMethod } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { env } from "@/env";
import { db } from "../database/drizzle";
import * as schema from "../database/schema";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // disableImplicitSignUp: true,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      // disableImplicitSignUp: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [admin({ ac, roles, defaultRole: "read", adminRoles: ["admin"] }), lastLoginMethod(), reactStartCookies()],
});
