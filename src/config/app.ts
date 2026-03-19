export type NavigationRoleAccess = "admin" | "write" | "read";

export type AppIconKey = "users" | "profile" | "products" | "categories" | "bundles";

export interface AppNavigationItem {
  title: string;
  url: string;
  icon: AppIconKey;
  roleAccess?: NavigationRoleAccess;
}

export interface AppConfig {
  appName: string;
  appTagline: string;
  authTitle: string;
  authDescription: string;
  defaultAuthenticatedPath: string;
  navigation: AppNavigationItem[];
}

export const defaultAuthenticatedPath = "/product";

const navigation: AppNavigationItem[] = [
  { title: "Users", url: "/user", icon: "users", roleAccess: "admin" },
  { title: "Products", url: "/product", icon: "products" },
  { title: "Categories", url: "/category", icon: "categories" },
  { title: "Bundles", url: "/bundle", icon: "bundles" },
];

export const appConfig: AppConfig = {
  appName: "Acme Inc",
  appTagline: "Dashboard",
  authTitle: "Welcome to Acme Inc Dashboard",
  authDescription: "Sign in to a reusable dashboard shell built for quick internal tools and admin workflows.",
  defaultAuthenticatedPath,
  navigation,
};
