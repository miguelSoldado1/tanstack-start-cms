import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import z from "zod";
import type { SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export interface TableQueryConfig<
  TSortColumns extends Record<string, PgColumn>,
  TFilterColumns extends Record<string, PgColumn> = TSortColumns,
> {
  sortColumns: TSortColumns;
  filterColumns: TFilterColumns;
  dateColumns?: Set<string>;
  textColumns?: Set<string>;
  rangeColumns?: Set<string>;
  numberColumns?: Set<string>;
}

export interface TableQueryInput {
  page: number;
  limit: number;
  sorting: Array<{ id: string; desc: boolean }>;
  filters: Record<string, string | number | (string | number)[]>;
}

export interface TableQueryResult<TData> {
  data: TData[];
  pageCount: number;
}

export interface QueryParams {
  whereClause?: SQL<unknown>;
  orderBy: SQL<unknown>[];
  limit: number;
  offset: number;
}

function parseDate(value: string | number): Date | null {
  const date =
    typeof value === "number"
      ? new Date(value)
      : typeof value === "string" && /^\d+$/.test(value)
        ? new Date(Number.parseInt(value, 10))
        : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildSortingClause<T extends Record<string, PgColumn>>(
  sorting: Array<{ id: string; desc: boolean }>,
  sortColumns: T
) {
  return sorting
    .map((sort) => {
      const column = sortColumns[sort.id];
      if (!column) return null;
      return sort.desc ? desc(column) : asc(column);
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function buildFilterConditions<T extends Record<string, PgColumn>>(
  filters: Record<string, string | number | (string | number)[]>,
  config: Pick<
    TableQueryConfig<Record<string, PgColumn>, T>,
    "filterColumns" | "dateColumns" | "textColumns" | "rangeColumns" | "numberColumns"
  >
): SQL<unknown>[] {
  const whereConditions: SQL<unknown>[] = [];

  for (const [key, value] of Object.entries(filters)) {
    const column = config.filterColumns[key];
    if (!(column && value)) continue;

    let condition: SQL<unknown> | null = null;

    // Check if it's a number column
    if (config.numberColumns?.has(key)) {
      if (Array.isArray(value)) {
        const conditions = value.map((v) => eq(column, v));
        condition = conditions.length > 0 ? or(...conditions)! : null;
      } else {
        condition = eq(column, value);
      }
    } else if (config.dateColumns?.has(key)) {
      // Handle date columns
      if (Array.isArray(value)) {
        const conditions = value
          .map((v) => {
            const date = parseDate(v);
            return date ? gte(column, date) : null;
          })
          .filter((condition): condition is NonNullable<typeof condition> => condition !== null);
        condition = conditions.length > 0 ? or(...conditions)! : null;
      } else {
        const date = parseDate(value);
        if (date) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          condition = and(gte(column, startOfDay), lte(column, endOfDay))!;
        }
      }
    } else if (config.rangeColumns?.has(key)) {
      // Handle numeric range columns (like price)
      if (Array.isArray(value) && value.length === 2) {
        const [min, max] = value.map((v) => Number(v));
        if (!(Number.isNaN(min) || Number.isNaN(max))) {
          condition = and(gte(column, min), lte(column, max))!;
        }
      } else {
        // Single value for range column - exact match
        const numValue = Number(value);
        if (!Number.isNaN(numValue)) {
          condition = gte(column, numValue);
        }
      }
    } else {
      // Handle text columns
      if (Array.isArray(value)) {
        const conditions = value.map((v) => ilike(column, `%${String(v)}%`));
        condition = conditions.length > 0 ? or(...conditions)! : null;
      } else {
        const stringValue = String(value);
        const searchTerms = stringValue.trim().split(/\s+/).filter(Boolean);
        if (searchTerms.length > 0) {
          if (searchTerms.length === 1) {
            condition = ilike(column, `%${searchTerms[0]}%`);
          } else {
            const wordConditions = searchTerms.map((term: string) => ilike(column, `%${term}%`));
            condition = and(...wordConditions)!;
          }
        }
      }
    }

    if (condition) {
      whereConditions.push(condition);
    }
  }

  return whereConditions;
}

export function buildQueryParams<
  TSortColumns extends Record<string, PgColumn>,
  TFilterColumns extends Record<string, PgColumn>,
>(input: TableQueryInput, config: TableQueryConfig<TSortColumns, TFilterColumns>): QueryParams {
  const offset = (input.page - 1) * input.limit;

  // Build order by clause from sorting
  const orderBy = buildSortingClause(input.sorting, config.sortColumns);

  // Build where conditions from filters
  const whereConditions = buildFilterConditions(input.filters, config);
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  return {
    whereClause,
    orderBy,
    limit: input.limit,
    offset,
  };
}

export const getTableDataInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sorting: z
    .array(z.object({ id: z.string(), desc: z.boolean() }))
    .optional()
    .default([]),
  filters: z
    .record(z.string(), z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]))
    .optional()
    .default({}),
});
