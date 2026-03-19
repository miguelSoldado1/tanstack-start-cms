import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { appConfig } from "@/config/app";
import { auth } from "@/lib/auth/auth";
import { hasNavigationRoleAccess } from "@/lib/auth/navigation-access";
import type { NavigationRoleAccess } from "@/config/app";

export const getUser = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session?.user;
});

const requireUserAccessInput = z
  .object({
    role: z.enum(["admin", "read", "write"]).optional(),
  })
  .optional();

export const requireUserAccess = createServerFn()
  .inputValidator(requireUserAccessInput)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    const user = session?.user;

    if (!user) {
      throw redirect({ to: "/sign-in" });
    }

    const requiredRole = data?.role as NavigationRoleAccess | undefined;

    if (requiredRole && !hasNavigationRoleAccess(user.role, requiredRole)) {
      throw redirect({ to: appConfig.defaultAuthenticatedPath });
    }

    return user;
  });
