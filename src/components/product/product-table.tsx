import { useServerFn } from "@tanstack/react-start";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useQueryTable } from "@/hooks/use-query-table";
import { getTableProducts } from "@/server/server-functions/product-functions";
import { columns } from "./product-columns";

export function ProductTable() {
  const getTableFn = useServerFn(getTableProducts);
  const { table, query } = useQueryTable({
    queryOptions: (params) => ({ queryKey: ["products", params], queryFn: () => getTableFn({ data: params }) }),
    initialState: { sorting: [{ id: "createdAt", desc: true }], columnPinning: { right: ["actions"] } },
    columns,
  });

  if (query.isPending && !query.isPlaceholderData) {
    return (
      <section>
        <DataTableSkeleton
          cellWidths={["5rem", "15rem", "8rem", "8rem"]}
          columnCount={4}
          filterCount={3}
          rowCount={10}
          shrinkZero
        />
      </section>
    );
  }

  return (
    <section>
      <DataTable table={table}>
        <DataTableToolbar isLoading={query.isFetching} refetch={query.refetch} table={table}>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>
    </section>
  );
}
