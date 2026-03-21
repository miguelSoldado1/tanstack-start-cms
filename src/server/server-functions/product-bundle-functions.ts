import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { readMiddleware, writeMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { createAuditLog, getAuditActor, toAuditPayload } from "@/server/audit";
import { buildQueryParams, getTableDataInput, type TableQueryConfig } from "../table-query";

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
  .middleware([readMiddleware])
  .inputValidator(getTableDataInput)
  .handler(({ data }) => getTableHandler(data));

const createBundleInput = z.object({
  primaryProductId: z.number(),
  bundledProductId: z.number(),
});

async function createHandler(input: z.infer<typeof createBundleInput>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [bundle] = await db.insert(schema.productBundle).values(input).returning();

    await createAuditLog({
      action: "create",
      actor,
      after: toAuditPayload(bundle),
      entityId: bundle.id.toString(),
      entityType: "productBundle",
    });

    return bundle.id;
  } catch (error) {
    throw new Error("Failed to create product bundle", { cause: error });
  }
}

export const createProductBundle = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(createBundleInput)
  .handler(({ context, data }) => createHandler(data, getAuditActor(context)));

const deleteBundleInput = z.object({
  id: z.number(),
});

async function deleteHandler(input: z.infer<typeof deleteBundleInput>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [deletedBundle] = await db.delete(schema.productBundle).where(eq(schema.productBundle.id, input.id)).returning();

    if (!deletedBundle) {
      throw new Error(`Product bundle with id ${input.id} not found`);
    }

    await createAuditLog({
      action: "delete",
      actor,
      before: toAuditPayload(deletedBundle),
      entityId: deletedBundle.id.toString(),
      entityType: "productBundle",
    });
  } catch (error) {
    throw new Error("Failed to delete product bundle", { cause: error });
  }
}

export const deleteProductBundle = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(deleteBundleInput)
  .handler(({ context, data }) => deleteHandler(data, getAuditActor(context)));
