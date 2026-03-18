export type NavigationRoleAccess = "admin" | "write" | "read";

export type AppIconKey =
  | "overview"
  | "users"
  | "profile"
  | "products"
  | "categories"
  | "bundles"
  | "resource"
  | "examples"
  | "app";

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
  enabledExamples: {
    catalog: boolean;
  };
  navigation: AppNavigationItem[];
}

export const defaultAuthenticatedPath = "/user";
const enabledExamples = {
  catalog: true,
} as const;

const coreNavigation: AppNavigationItem[] = [{ title: "Users", url: "/user", icon: "users", roleAccess: "admin" }];

const catalogNavigation: AppNavigationItem[] = [
  { title: "Products", url: "/product", icon: "products" },
  { title: "Categories", url: "/category", icon: "categories" },
  { title: "Bundles", url: "/bundle", icon: "bundles" },
];

const generatedNavigation: AppNavigationItem[] = [
  // __GENERATED_NAV_ITEMS__
];

const navigation: AppNavigationItem[] = [
  ...coreNavigation,
  ...(enabledExamples.catalog ? catalogNavigation : []),
  ...generatedNavigation,
];

export const appConfig: AppConfig = {
  appName: "Starter Dashboard",
  appTagline: "Reusable admin shell",
  authTitle: "Welcome to Starter Dashboard",
  authDescription: "Sign in to a reusable dashboard shell built for quick internal tools and admin workflows.",
  defaultAuthenticatedPath,
  enabledExamples,
  navigation,
};
