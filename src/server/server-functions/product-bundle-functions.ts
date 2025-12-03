import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { buildQueryParams, getTableDataInput, type TableQueryConfig } from "../table-query";
import type z from "zod";

const SORT_COLUMNS = {
  createdAt: schema.productBundle.createdAt,
  updatedAt: schema.productBundle.updatedAt,
} as const;

const FILTER_COLUMNS = {
  id: schema.productBundle.id,
  createdAt: schema.productBundle.createdAt,
  updatedAt: schema.productBundle.updatedAt,
} as const;

const CONFIG: TableQueryConfig<typeof SORT_COLUMNS, typeof FILTER_COLUMNS> = {
  sortColumns: SORT_COLUMNS,
  filterColumns: FILTER_COLUMNS,
  dateColumns: new Set(["createdAt", "updatedAt"]),
  numberColumns: new Set(["id"]),
} as const;

async function getTableHandler(input: z.infer<typeof getTableDataInput>) {
  // Build query parameters using the reusable utility
  const queryParams = buildQueryParams(input, CONFIG);

  // Create table aliases for joining the same product table twice
  const primaryProduct = alias(schema.product, "primary_product");
  const bundledProduct = alias(schema.product, "bundled_product");

  const baseQuery = db
    .select({
      id: schema.productBundle.id,
      primaryProductId: schema.productBundle.primaryProductId,
      bundledProductId: schema.productBundle.bundledProductId,
      primaryProductName: primaryProduct.name,
      bundledProductName: bundledProduct.name,
      createdAt: schema.productBundle.createdAt,
      updatedAt: schema.productBundle.updatedAt,
    })
    .from(schema.productBundle)
    .innerJoin(primaryProduct, eq(schema.productBundle.primaryProductId, primaryProduct.id))
    .innerJoin(bundledProduct, eq(schema.productBundle.bundledProductId, bundledProduct.id));

  const filterQuery = queryParams.whereClause ? baseQuery.where(queryParams.whereClause) : baseQuery;
  const sortedQuery = queryParams.orderBy.length > 0 ? filterQuery.orderBy(...queryParams.orderBy) : filterQuery;

  const [data, totalCount] = await Promise.all([
    sortedQuery.limit(queryParams.limit).offset(queryParams.offset),
    db.select({ count: count() }).from(schema.productBundle).where(queryParams.whereClause),
  ]);

  return {
    data,
    pageCount: Math.ceil(totalCount[0].count / queryParams.limit),
  };
}

export const getTableProductBundles = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getTableDataInput)
  .handler(({ data }) => getTableHandler(data));
