import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  type ComboboxProps,
} from "@/components/ui/combobox";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface AsyncComboboxOption {
  label: string;
  value: string;
}

type AsyncComboboxOptionPredicate = (option: AsyncComboboxOption) => boolean;

interface AsyncComboboxProps
  extends Omit<
    ComboboxProps<AsyncComboboxOption>,
    | "children"
    | "defaultValue"
    | "filter"
    | "filteredItems"
    | "inputValue"
    | "itemToStringLabel"
    | "itemToStringValue"
    | "items"
    | "onInputValueChange"
    | "onOpenChange"
    | "onValueChange"
    | "value"
  > {
  value?: string;
  onValueChange: (value: string) => void;
  queryKey: string;
  queryFn: (input: { search?: string }) => Promise<AsyncComboboxOption[]>;
  debounceMs?: number;
  placeholder?: string;
  emptyText?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  isOptionDisabled?: AsyncComboboxOptionPredicate;
}

export function AsyncCombobox({
  value,
  onValueChange,
  queryKey,
  queryFn,
  debounceMs = 300,
  placeholder = "Search...",
  emptyText = "No results found.",
  loadingText = "Searching...",
  className,
  disabled,
  isOptionDisabled,
  ...props
}: AsyncComboboxProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [optionCache, setOptionCache] = React.useState<Map<string, AsyncComboboxOption>>(new Map());

  const popupContainer = React.useMemo(() => {
    const candidate = rootRef.current?.closest("[data-slot='dialog-content']");
    return candidate instanceof HTMLElement ? candidate : null;
  }, [open]);

  const setDebounced = useDebouncedCallback((next: string) => {
    setDebouncedSearch(next);
  }, debounceMs);

  const query = useQuery<AsyncComboboxOption[]>({
    enabled: open,
    queryKey: [queryKey, "combobox-options", debouncedSearch],
    queryFn: () => queryFn({ search: debouncedSearch || undefined }),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData ?? [],
  });

  React.useEffect(() => {
    if (!query.data?.length) return;

    setOptionCache((previousCache) => {
      const nextCache = new Map(previousCache);

      for (const option of query.data) {
        nextCache.set(option.value, option);
      }

      return nextCache;
    });
  }, [query.data]);

  const options = query.data ?? [];
  const isLoading = query.isPending && options.length === 0;
  const selectedOption = value ? (optionCache.get(value) ?? query.data?.find((option) => option.value === value)) : null;

  React.useEffect(() => {
    if (!open) {
      setSearch(selectedOption?.label ?? "");
    }
  }, [open, selectedOption?.label]);

  function handleSearchChange(next: string) {
    setSearch(next);
    setDebounced(next);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSearch(selectedOption?.label ?? "");
      setDebouncedSearch("");
    } else if (selectedOption) {
      setSearch(selectedOption.label);
    }
  }

  function handleValueChange(nextValue: AsyncComboboxOption | null) {
    if (nextValue) {
      setOptionCache((previousCache) => new Map(previousCache).set(nextValue.value, nextValue));
      setSearch(nextValue.label);
      onValueChange(nextValue.value);
      return;
    }

    setSearch("");
    onValueChange("");
  }

  return (
    <div className={className} ref={rootRef}>
      <Combobox
        {...props}
        autoHighlight
        disabled={disabled}
        filter={null}
        inputValue={search}
        items={options}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        onInputValueChange={handleSearchChange}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
        open={open}
        value={selectedOption}
      >
        <ComboboxInput disabled={disabled} placeholder={placeholder} />
        <ComboboxContent container={popupContainer}>
          <ComboboxEmpty>{isLoading ? loadingText : emptyText}</ComboboxEmpty>
          <ComboboxList>
            <ComboboxCollection>
              {(option: AsyncComboboxOption) => (
                <ComboboxItem disabled={isOptionDisabled?.(option)} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
