import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { buildQueryParams, getTableDataInput, type TableQueryConfig } from "../table-query";
import type z from "zod";

const SORT_COLUMNS = {
  createdAt: schema.user.createdAt,
  updatedAt: schema.user.updatedAt,
} as const;

const FILTER_COLUMNS = {
  id: schema.user.id,
  name: schema.user.name,
  createdAt: schema.user.createdAt,
} as const;

const CONFIG: TableQueryConfig<typeof SORT_COLUMNS, typeof FILTER_COLUMNS> = {
  sortColumns: SORT_COLUMNS,
  filterColumns: FILTER_COLUMNS,
  dateColumns: new Set(["createdAt"]),
  textColumns: new Set(["name", "id"]),
} as const;

async function getTableHandler(input: z.infer<typeof getTableDataInput>) {
  // Build query parameters using the reusable utility
  const queryParams = buildQueryParams(input, CONFIG);

  // Build queries
  const baseQuery = db.select().from(schema.user);
  const filterQuery = queryParams.whereClause ? baseQuery.where(queryParams.whereClause) : baseQuery;
  const sortedQuery = queryParams.orderBy.length > 0 ? filterQuery.orderBy(...queryParams.orderBy) : filterQuery;

  const [data, totalCount] = await Promise.all([
    sortedQuery.limit(queryParams.limit).offset(queryParams.offset),
    db.select({ count: count() }).from(schema.user).where(queryParams.whereClause),
  ]);

  return {
    data,
    pageCount: Math.ceil(totalCount[0].count / queryParams.limit),
  };
}

export const getTableUsers = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getTableDataInput)
  .handler(({ data }) => getTableHandler(data));
