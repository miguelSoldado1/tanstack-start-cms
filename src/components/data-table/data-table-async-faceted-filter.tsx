import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import type { Column } from "@tanstack/react-table";
import type { Option } from "@/types/data-table";

interface DataTableAsyncFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  multiple?: boolean;
  debounceMs?: number;
  queryKey: string;
  queryFn: (input: { search?: string }) => Promise<Option[]>;
}

export function DataTableAsyncCategoryFilter<TData, TValue>({
  column,
  title,
  multiple,
  debounceMs = 300,
  queryKey,
  queryFn,
}: DataTableAsyncFacetedFilterProps<TData, TValue>) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [optionCache, setOptionCache] = React.useState<Map<string, Option>>(new Map());

  const selectedValues = (column?.getFilterValue() as string[]) ?? [];

  const setDebounced = useDebouncedCallback((next: string) => {
    setDebouncedSearch(next);
  }, debounceMs);

  const onSearchChange = React.useCallback(
    (next: string) => {
      setSearch(next);
      setDebounced(next);
    },
    [setDebounced]
  );

  const query = useQuery<Option[]>({
    queryKey: [queryKey, "async-options", debouncedSearch],
    queryFn: () => queryFn({ search: debouncedSearch || undefined }),
    staleTime: 60_000,
    placeholderData: (prev) => prev ?? [],
  });

  React.useEffect(() => {
    if (!query.data && selectedValues.length === 0) return;

    setOptionCache((prev) => {
      const next = new Map(prev);

      for (const option of query.data ?? []) {
        next.set(option.value, option);
      }

      for (const value of selectedValues) {
        if (!next.has(value)) {
          next.set(value, { value, label: value });
        }
      }

      return next;
    });
  }, [query.data, selectedValues.join(",")]);

  const selectedOptions = React.useMemo(() => {
    const selected = new Set(selectedValues);
    return Array.from(optionCache.values()).filter((option) => selected.has(option.value));
  }, [optionCache, selectedValues]);

  return (
    <DataTableFacetedFilter
      column={column}
      multiple={multiple}
      onSearchChange={onSearchChange}
      options={query.data ?? []}
      searchValue={search}
      selectedOptions={selectedOptions}
      title={title}
    />
  );
}
