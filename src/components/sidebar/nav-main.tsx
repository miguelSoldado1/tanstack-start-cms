import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { PackageIcon, PackageOpenIcon, SettingsIcon, TagIcon, UsersRoundIcon } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/auth-client";
import { filterNavigationItemsByRole } from "@/lib/auth/navigation-access";
import type { LucideIcon } from "lucide-react";
import type { AppIconKey, AppNavigationItem } from "@/config/app";

const iconMap = {
  users: UsersRoundIcon,
  profile: SettingsIcon,
  products: PackageOpenIcon,
  categories: TagIcon,
  bundles: PackageIcon,
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
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <SidebarMenu className="p-2">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  const navigationItems = filterNavigationItemsByRole(items, session?.user.role);

  return <SidebarMenu className="p-2">{navigationItems.map((item) => renderNavigationItem(item, pathname))}</SidebarMenu>;
}
