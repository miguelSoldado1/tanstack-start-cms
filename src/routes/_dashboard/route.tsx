import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UsersRoundIcon } from "lucide-react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { NavigationItem } from "@/components/sidebar/nav-main";

const navigationData: NavigationItem[] = [
  {
    title: "Users",
    url: "/user",
    icon: UsersRoundIcon,
  },
];

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
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
