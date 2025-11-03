import { createServerFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { buildQueryParams, getTableDataInput, type TableQueryConfig } from "../table-query";

const SORT_COLUMNS = {
  price: schema.product.price,
  createdAt: schema.product.createdAt,
  updatedAt: schema.product.updatedAt,
} as const;

const FILTER_COLUMNS = {
  name: schema.product.name,
  sku: schema.product.sku,
  price: schema.product.price,
  createdAt: schema.product.createdAt,
  updatedAt: schema.product.updatedAt,
} as const;

const CONFIG: TableQueryConfig<typeof SORT_COLUMNS, typeof FILTER_COLUMNS> = {
  sortColumns: SORT_COLUMNS,
  filterColumns: FILTER_COLUMNS,
  dateRangeColumns: new Set(["createdAt", "updatedAt"]),
  textColumns: new Set(["name", "sku"]),
  rangeColumns: new Set(["price"]),
} as const;

async function getTableHandler(input: z.infer<typeof getTableDataInput>) {
  // Build query parameters using the reusable utility
  const queryParams = buildQueryParams(input, CONFIG);

  // Build queries
  const baseQuery = db.select().from(schema.product);
  const filterQuery = queryParams.whereClause ? baseQuery.where(queryParams.whereClause) : baseQuery;
  const sortedQuery = queryParams.orderBy.length > 0 ? filterQuery.orderBy(...queryParams.orderBy) : filterQuery;

  const [data, totalCount] = await Promise.all([
    sortedQuery.limit(queryParams.limit).offset(queryParams.offset),
    db.select({ count: count() }).from(schema.product).where(queryParams.whereClause),
  ]);

  return {
    data,
    pageCount: Math.ceil(totalCount[0].count / queryParams.limit),
  };
}

export const getTableProducts = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getTableDataInput)
  .handler(({ data }) => getTableHandler(data));

const getProductSchema = z.object({ id: z.number().positive() });

async function getFirstHandler(input: z.infer<typeof getProductSchema>) {
  const [product] = await db.select().from(schema.product).where(eq(schema.product.id, input.id));
  if (!product) {
    throw new Error(`Product with id ${input.id} not found`);
  }

  return product;
}

export const getProduct = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getProductSchema)
  .handler(({ data }) => getFirstHandler(data));

const deleteProductSchema = z.object({ id: z.number().positive() });

async function deleteHandler(input: z.infer<typeof deleteProductSchema>) {
  const [existingProduct] = await db
    .select({ id: schema.product.id })
    .from(schema.product)
    .where(eq(schema.product.id, input.id));

  if (!existingProduct) {
    throw new Error(`Product with id ${input.id} not found`);
  }

  await db.delete(schema.product).where(eq(schema.product.id, input.id));
}

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteProductSchema)
  .handler(({ data }) => deleteHandler(data));

const updateProductInput = z.object({
  id: z.number().positive(),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  sku: z.string().min(2).max(10),
  price: z.number().min(0.01).multipleOf(0.01),
});

async function updateHandler(input: z.infer<typeof updateProductInput>) {
  const [existingProduct] = await db
    .select({ id: schema.product.id })
    .from(schema.product)
    .where(eq(schema.product.id, input.id));

  if (!existingProduct) {
    throw new Error(`Product with id ${input.id} not found`);
  }

  await db
    .update(schema.product)
    .set({ ...input, price: input.price.toFixed(2), updatedAt: new Date() })
    .where(eq(schema.product.id, input.id));
}

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateProductInput)
  .handler(({ data }) => updateHandler(data));
