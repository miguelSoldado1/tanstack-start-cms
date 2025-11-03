import { Link, type LinkProps } from "@tanstack/react-router";
import clsx from "clsx";
import { DownloadIcon, EditIcon, EllipsisIcon, TrashIcon } from "lucide-react";
import * as DropdownMenuCore from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ActionsMenuTriggerEllipsis() {
  return (
    <DropdownMenuCore.DropdownMenuTrigger asChild>
      <Button aria-label="Open menu" className="flex size-8 p-0" variant="ghost">
        <EllipsisIcon aria-hidden="true" className="size-4" />
      </Button>
    </DropdownMenuCore.DropdownMenuTrigger>
  );
}

export function ActionsMenuEditItemLink({ className, ...props }: LinkProps & { className?: string }) {
  return (
    <DropdownMenuCore.DropdownMenuItem asChild>
      <Link className={clsx("cursor-pointer", className)} {...props}>
        <EditIcon className="size-4" />
        Edit
      </Link>
    </DropdownMenuCore.DropdownMenuItem>
  );
}

export function ActionsMenuEditItemButton(props: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuCore.DropdownMenuItem {...props}>
      <EditIcon className="size-4" />
      Edit
    </DropdownMenuCore.DropdownMenuItem>
  );
}

export function ActionsMenuDownloadButton({ className, ...props }: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuCore.DropdownMenuItem className={clsx("cursor-pointer", className)} {...props}>
      <DownloadIcon className="size-4" />
      Download
    </DropdownMenuCore.DropdownMenuItem>
  );
}

export function ActionsMenuDeleteButton({ className, ...props }: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuCore.DropdownMenuItem className={clsx("text-destructive focus:text-destructive", className)} {...props}>
      <TrashIcon className="size-4 text-destructive" />
      Delete
    </DropdownMenuCore.DropdownMenuItem>
  );
}

export const ActionsMenu = DropdownMenuCore.DropdownMenu;
export const ActionsContent = DropdownMenuCore.DropdownMenuContent;
