import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ImpersonationBanner } from "@/components/auth/impersonation-banner";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { appConfig } from "@/config/app";
import { requireUserAccess } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await requireUserAccess({ data: { role: "read" } });
    if (!user) {
      throw redirect({ to: "/sign-in" });
    }
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar navigationItems={appConfig.navigation} />
      <SidebarInset className="px-4">
        <div className="-left-2 fixed top-16 z-50 md:hidden">
          <div className="rounded-r-md border border-sidebar-border bg-sidebar p-1 pl-3 shadow-lg">
            <SidebarTrigger className="size-8" />
          </div>
        </div>
        <ImpersonationBanner />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
