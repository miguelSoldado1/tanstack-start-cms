import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { appConfig } from "@/config/app";
import { hasNavigationRoleAccess } from "@/lib/auth/navigation-access";
import { auth } from "./auth";
import type { NavigationRoleAccess } from "@/config/app";

function createRoleMiddleware(requiredRole?: NavigationRoleAccess) {
  return createMiddleware().server(async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect({ to: "/sign-in" });
    }

    if (requiredRole && !hasNavigationRoleAccess(session.user.role, requiredRole)) {
      throw redirect({ to: appConfig.defaultAuthenticatedPath });
    }

    return await next({ context: session });
  });
}

export const authMiddleware = createRoleMiddleware();
export const writeMiddleware = createRoleMiddleware("write");
export const adminMiddleware = createRoleMiddleware("admin");
