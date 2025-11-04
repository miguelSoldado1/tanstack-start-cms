import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { getAllProductCategories } from "@/server/server-functions/product-category-functions";
import { DataTable } from "../../data-table/data-table";
import { DataTableSkeleton } from "../../data-table/data-table-skeleton";
import { AddProductCategory } from "./add-product-category";
import { columns } from "./product-category-columns";

interface ProductCategoriesTableProps {
  productId: number;
}

export function ProductCategoryTable({ productId }: ProductCategoriesTableProps) {
  const getTableFn = useServerFn(getAllProductCategories);
  const query = useQuery({
    queryKey: ["productCategories", productId],
    queryFn: () => getTableFn({ data: { productId } }),
  });

  const table = useReactTable({
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    initialState: { sorting: [{ id: "createdAt", desc: true }], pagination: { pageIndex: 0, pageSize: 3 } },
    data: query.data ?? [],
    columns,
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end" />
      {!query.isPending || query.isPlaceholderData ? (
        <>
          <DataTable showPagination={false} table={table} />
          <div className="flex items-center">
            <AddProductCategory existingCategories={query.data?.map((row) => row.categoryId) ?? []} productId={productId} />
            <DataTablePagination pageSizeOptions={[3, 5, 10]} table={table} />
          </div>
        </>
      ) : (
        <DataTableSkeleton
          cellWidths={["3rem", "5rem", "3rem", "3rem"]}
          columnCount={4}
          rowCount={3}
          shrinkZero
          withViewOptions={false}
        />
      )}
    </div>
  );
}
