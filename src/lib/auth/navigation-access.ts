import type { AppNavigationItem, NavigationRoleAccess } from "@/config/app";

const roleAccessRank: Record<NavigationRoleAccess, number> = {
  read: 0,
  write: 1,
  admin: 2,
};

export function normalizeNavigationRole(role?: string | null): NavigationRoleAccess {
  switch (role) {
    case "admin":
      return "admin";
    case "write":
      return "write";
    default:
      return "read";
  }
}

export function hasNavigationRoleAccess(role: string | null | undefined, requiredRole?: NavigationRoleAccess): boolean {
  if (!requiredRole) {
    return true;
  }

  return roleAccessRank[normalizeNavigationRole(role)] >= roleAccessRank[requiredRole];
}

export function filterNavigationItemsByRole(items: AppNavigationItem[], role?: string | null): AppNavigationItem[] {
  return items.filter((item) => hasNavigationRoleAccess(role, item.roleAccess));
}
