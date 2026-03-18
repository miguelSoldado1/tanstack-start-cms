import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import {
  FolderKanbanIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PackageOpenIcon,
  SettingsIcon,
  TagIcon,
  UsersRoundIcon,
} from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import type { AppIconKey, AppNavigationItem } from "@/config/app";

const iconMap = {
  overview: LayoutDashboardIcon,
  users: UsersRoundIcon,
  profile: SettingsIcon,
  products: PackageOpenIcon,
  categories: TagIcon,
  bundles: PackageIcon,
  resource: FolderKanbanIcon,
  examples: FolderKanbanIcon,
  app: LayoutDashboardIcon,
} satisfies Record<AppIconKey, LucideIcon>;

interface NavMainProps {
  items: AppNavigationItem[];
}

function renderNavigationItem(item: AppNavigationItem, pathname: string) {
  const Icon = iconMap[item.icon];

  return (
    <SidebarMenuItem className={clsx("rounded-lg", pathname === item.url && "bg-muted")} key={item.title}>
      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
        <Link to={item.url}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ items }: NavMainProps) {
  const pathname = useLocation({ select: (location) => location.pathname });

  return <SidebarMenu className="p-2">{items.map((item) => renderNavigationItem(item, pathname))}</SidebarMenu>;
}
