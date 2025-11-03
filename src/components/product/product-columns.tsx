import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate } from "@/lib/format";
import { ProductActionsDropdownMenu } from "./product-actions-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
// import { ProductActionsDropdownMenu } from "./product-actions-dropdown-menu";
import type { product } from "@/lib/database/schema";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export const columns: ColumnDef<typeof product.$inferSelect>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableMultiSort: false,
    meta: {
      label: "Name",
      variant: "text",
      placeholder: "Search name…",
    },
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: "sku",
    accessorKey: "sku",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sku" />,
    meta: { label: "Sku", variant: "text", placeholder: "Search sku…" },
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: "price",
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ getValue }) => currency(getValue<number>()),
    meta: {
      label: "Price",
      variant: "range",
      unit: "$",
      range: [0, 2000],
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
    cell: ({ getValue }) => formatDate(getValue<Date>()),
    meta: {
      label: "Created date",
      variant: "dateRange",
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
      variant: "dateRange",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell({ row }) {
      return <ProductActionsDropdownMenu id={row.original.id} />;
    },
    size: 20,
  },
];
