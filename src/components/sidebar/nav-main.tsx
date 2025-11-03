import { Link, type LinkProps, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  url: LinkProps["to"];
  icon: LucideIcon;
  items?: {
    title: string;
    url: LinkProps["to"];
    icon?: LucideIcon;
  }[];
  roleAccess?: "admin" | "write" | "read";
}

interface NavMainProps {
  items: NavigationItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <SidebarMenu className="p-2">
      {items.map((item) => (
        <SidebarMenuItem className={clsx("rounded-lg", pathname === item.url && "bg-muted")} key={item.title}>
          {item.items && item.items.length > 0 ? (
            <Collapsible
              asChild
              className="group/collapsible"
              defaultOpen={item.items.some((subItem) => subItem.url === pathname)}
            >
              <div>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="cursor-pointer" tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem
                        className={clsx(pathname === item.url && "rounded-lg bg-muted")}
                        key={subItem.title}
                      >
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ) : (
            <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
