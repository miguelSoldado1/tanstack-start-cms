import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PackageOpenIcon, TagIcon, UsersRoundIcon } from "lucide-react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUser } from "@/server/server-functions/auth-functions";
import type { NavigationItem } from "@/components/sidebar/nav-main";

const navigationData: NavigationItem[] = [
  { title: "Users", url: "/user", icon: UsersRoundIcon },
  { title: "Products", url: "/product", icon: PackageOpenIcon },
  { title: "Categories", url: "/category", icon: TagIcon },
];

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/sign-in" });
    }
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar navigationItems={navigationData} />
      <SidebarInset className="px-4">
        <div className="-left-2 fixed top-16 z-50 md:hidden">
          <div className="rounded-r-md border border-sidebar-border bg-sidebar p-1 pl-3 shadow-lg">
            <SidebarTrigger className="size-8" />
          </div>
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
