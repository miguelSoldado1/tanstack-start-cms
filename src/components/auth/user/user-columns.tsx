import { formatDate } from "@/lib/format";
import { DataTableColumnHeader } from "../../data-table/data-table-column-header";
import { Badge } from "../../ui/badge";
import { getRoleColorByStatus } from "../../utils";
import { UserActionsDropdownMenu } from "./user-actions-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import type { user } from "@/lib/database/schema";

export const columns: ColumnDef<typeof user.$inferSelect>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Id" />,
    meta: {
      label: "Id",
      variant: "text",
      placeholder: "Search by id...",
    },
    enableSorting: false,
    enableColumnFilter: true,
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
