import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/auth-middleware";

export const getUser = createServerFn()
  .middleware([authMiddleware])
  .handler(({ context }) => {
    return context?.user;
  });
