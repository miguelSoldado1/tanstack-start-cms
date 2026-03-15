import { Facehash } from "facehash";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format";
import { DataTableColumnHeader } from "../../data-table/data-table-column-header";
import { Badge } from "../../ui/badge";
import { getRoleColorByStatus } from "../../utils";
import { UserActionsDropdownMenu } from "./user-actions-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import type { user } from "@/lib/database/schema";

const FACEHASH_COLORS = ["#0f766e", "#f59e0b", "#2563eb", "#ef4444", "#7c3aed"];

export const columns: ColumnDef<typeof user.$inferSelect>[] = [
  {
    id: "avatar",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Avatar" />,
    cell: ({ row }) => {
      const { email, image, name } = row.original;
      const imageSrc = image?.trim() || undefined;

      return (
        <Avatar className="size-7 border">
          <AvatarImage alt={name} className="object-cover" src={imageSrc} />
          <AvatarFallback className="bg-transparent p-0">
            <Facehash
              colors={FACEHASH_COLORS}
              intensity3d="none"
              interactive={false}
              name={email}
              showInitial={false}
              size={28}
            />
          </AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 60,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    meta: {
      label: "Name",
      variant: "text",
      placeholder: "Search name…",
    },
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    meta: { label: "Email" },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ getValue }) => <Badge className={getRoleColorByStatus(getValue<string>())}>{getValue<string>()}</Badge>,
    meta: { label: "Role" },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
    cell: ({ getValue }) => formatDate(getValue<Date>()),
    meta: {
      label: "Created date",
      variant: "date",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell({ row }) {
      return <UserActionsDropdownMenu id={row.original.id} />;
    },
    size: 20,
  },
];
