import { GalleryVerticalEndIcon, PanelLeftIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Kbd, KbdGroup } from "../ui/kbd";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import type * as React from "react";
import type { NavigationItem } from "./nav-main";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationItems: NavigationItem[];
}

export function AppSidebar({ navigationItems, ...props }: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 w-full items-center gap-2 overflow-hidden p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:p-0! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
              <div className="flex aspect-square size-8 items-center justify-center">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Acme Inc</span>
                <span className="truncate text-xs">Dashboard</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="hidden lg:block">
            <SidebarMenuButton className="cursor-pointer" onClick={toggleSidebar} tooltip="Toggle Sidebar">
              <PanelLeftIcon />
              <span>Toggle Sidebar</span>
              <KbdGroup className="ml-auto">
                <Kbd className="bg-transparent">Ctrl</Kbd>
                <span className="text-muted-foreground">+</span>
                <Kbd className="bg-transparent">B</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <DropdownMenuSeparator />
          <NavUser />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
