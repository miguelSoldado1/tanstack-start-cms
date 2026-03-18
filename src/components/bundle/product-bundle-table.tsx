import { useServerFn } from "@tanstack/react-start";
import { useQueryTable } from "@/hooks/use-query-table";
import { getTableProductBundles } from "@/server/server-functions/product-bundle-functions";
import { DataTable } from "../data-table/data-table";
import { DataTableSkeleton } from "../data-table/data-table-skeleton";
import { DataTableSortList } from "../data-table/data-table-sort-list";
import { DataTableToolbar } from "../data-table/data-table-toolbar";
import { columns } from "./product-bundle-columns";

export function ProductBundleTable() {
  const getTableFn = useServerFn(getTableProductBundles);
  const { table, query } = useQueryTable({
    queryOptions: (params) => ({ queryKey: ["productBundles", params], queryFn: () => getTableFn({ data: params }) }),
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
