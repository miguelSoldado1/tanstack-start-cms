import { formatDate } from "@/lib/format";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteProductBundle } from "./delete-product-bundle";
import type { ColumnDef } from "@tanstack/react-table";
import type { productBundle } from "@/lib/database/schema";

export const columns: ColumnDef<typeof productBundle.$inferSelect>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Id" />,
    meta: {
      label: "Id",
      variant: "number",
      placeholder: "Search id…",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "primaryProductName",
    accessorKey: "primaryProductName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Primary Product Name" />,
    enableSorting: false,
  },
  {
    id: "bundledProductName",
    accessorKey: "bundledProductName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bundled Product Name" />,
    enableSorting: false,
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
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated Date" />,
    cell: ({ getValue }) => formatDate(getValue<Date>()),
    meta: {
      label: "Updated date",
      variant: "date",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell({ row }) {
      return <DeleteProductBundle id={row.original.id} />;
    },
    size: 20,
  },
];
