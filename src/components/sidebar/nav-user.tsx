import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOutIcon, Monitor, Moon, Sun, UserPenIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/auth-client";
import { Skeleton } from "../ui/skeleton";

export function NavUser() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { data } = authClient.useSession();
  const { setTheme } = useTheme();

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      return toast.error(error.message || "An error occurred while signing out.");
    }

    navigate({ to: "/sign-in" });
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            disabled={!data?.user}
            size="lg"
          >
            <Avatar className="size-8 rounded-full border">
              {data?.user ? <AvatarFallback>{data.user.name.charAt(0).toUpperCase()}</AvatarFallback> : null}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              {data?.user ? (
                <span className="truncate font-medium">{data.user.name}</span>
              ) : (
                <Skeleton className="mb-1 h-3 w-1/2" />
              )}
              {data?.user ? <span className="truncate text-xs">{data.user.email}</span> : <Skeleton className="h-3 w-2/3" />}
            </div>
            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "top"}
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-full border">
                {data?.user ? <AvatarFallback>{data.user.name.charAt(0).toUpperCase()}</AvatarFallback> : null}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium">{data?.user.name}</span>
                </div>
                <span className="truncate text-xs">{data?.user.email}</span>
              </div>
              {data?.user.role && (
                <Badge className="ml-auto" variant="secondary">
                  {data.user.role}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Sun className="size-4 text-muted-foreground dark:hidden" />
              <Moon className="hidden size-4 text-muted-foreground dark:block" />
              Change theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor />
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <UserPenIcon />
              Edit Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
