import { createServerFn } from "@tanstack/react-start";
import { countDistinct, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import z from "zod";
import { readMiddleware, writeMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { createAuditLog, getAuditActor, toAuditPayload } from "@/server/audit";
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
  category: schema.category.id,
} as const;

const CONFIG: TableQueryConfig<typeof SORT_COLUMNS, typeof FILTER_COLUMNS> = {
  sortColumns: SORT_COLUMNS,
  filterColumns: FILTER_COLUMNS,
  dateRangeColumns: new Set(["createdAt", "updatedAt"]),
  textColumns: new Set(["name", "sku", "id"]),
  rangeColumns: new Set(["price"]),
  numberColumns: new Set(["category"]),
} as const;

async function getTableHandler(input: z.infer<typeof getTableDataInput>) {
  // Build query parameters using the reusable utility
  const queryParams = buildQueryParams(input, CONFIG);

  // Build queries
  const baseQuery = db
    .select({
      ...getTableColumns(schema.product),
      category: sql<string | null>`string_agg(DISTINCT ${schema.category.name}, ', ')`,
    })
    .from(schema.product)
    .leftJoin(schema.productCategory, eq(schema.productCategory.productId, schema.product.id))
    .leftJoin(schema.category, eq(schema.productCategory.categoryId, schema.category.id))
    .groupBy(schema.product.id);

  const filterQuery = queryParams.whereClause ? baseQuery.where(queryParams.whereClause) : baseQuery;
  const sortedQuery = queryParams.orderBy.length > 0 ? filterQuery.orderBy(...queryParams.orderBy) : filterQuery;

  const countQueryBase = db
    .select({ count: countDistinct(schema.product.id) })
    .from(schema.product)
    .leftJoin(schema.productCategory, eq(schema.productCategory.productId, schema.product.id))
    .leftJoin(schema.category, eq(schema.productCategory.categoryId, schema.category.id));

  const totalCountQuery = queryParams.whereClause ? countQueryBase.where(queryParams.whereClause) : countQueryBase;

  const [data, totalCount] = await Promise.all([
    sortedQuery.limit(queryParams.limit).offset(queryParams.offset),
    totalCountQuery,
  ]);

  return {
    data,
    pageCount: Math.ceil(totalCount[0].count / queryParams.limit),
  };
}

export const getTableProducts = createServerFn()
  .middleware([readMiddleware])
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
  .middleware([readMiddleware])
  .inputValidator(getProductSchema)
  .handler(({ data }) => getFirstHandler(data));

const deleteProductSchema = z.object({ id: z.number().positive() });

async function deleteHandler(input: z.infer<typeof deleteProductSchema>, actor: ReturnType<typeof getAuditActor>) {
  const [deletedProduct] = await db.delete(schema.product).where(eq(schema.product.id, input.id)).returning();

  if (!deletedProduct) {
    throw new Error(`Product with id ${input.id} not found`);
  }

  await createAuditLog({
    action: "delete",
    actor,
    before: toAuditPayload(deletedProduct),
    entityId: deletedProduct.id.toString(),
    entityType: "product",
  });
}

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(deleteProductSchema)
  .handler(({ context, data }) => deleteHandler(data, getAuditActor(context)));

const updateProductInput = z.object({
  id: z.number().positive(),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  sku: z.string().min(2).max(10),
  price: z.number().min(0.01).multipleOf(0.01),
});

async function updateHandler(input: z.infer<typeof updateProductInput>, actor: ReturnType<typeof getAuditActor>) {
  const [previousProduct] = await db.select().from(schema.product).where(eq(schema.product.id, input.id));

  if (!previousProduct) {
    throw new Error(`Product with id ${input.id} not found`);
  }

  const [updatedProduct] = await db
    .update(schema.product)
    .set({
      description: input.description,
      name: input.name,
      price: input.price.toFixed(2),
      sku: input.sku,
      updatedAt: new Date(),
    })
    .where(eq(schema.product.id, input.id))
    .returning();

  await createAuditLog({
    action: "update",
    actor,
    after: toAuditPayload(updatedProduct),
    before: toAuditPayload(previousProduct),
    entityId: updatedProduct.id.toString(),
    entityType: "product",
  });
}

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(updateProductInput)
  .handler(({ context, data }) => updateHandler(data, getAuditActor(context)));

const createProductInput = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  sku: z.string().min(2).max(10),
  price: z.number().min(0.01).multipleOf(0.01),
});

async function createHandler(input: z.infer<typeof createProductInput>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [product] = await db
      .insert(schema.product)
      .values({
        description: input.description,
        name: input.name,
        price: input.price.toFixed(2),
        sku: input.sku,
      })
      .returning();

    await createAuditLog({
      action: "create",
      actor,
      after: toAuditPayload(product),
      entityId: product.id.toString(),
      entityType: "product",
    });

    return product.id;
  } catch (error) {
    throw new Error("Failed to create product", { cause: error });
  }
}

export const createProduct = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(createProductInput)
  .handler(({ context, data }) => createHandler(data, getAuditActor(context)));

const publishProductSchema = z.object({
  id: z.number().positive(),
});

async function publishHandler(input: z.infer<typeof publishProductSchema>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [previousProduct] = await db.select().from(schema.product).where(eq(schema.product.id, input.id));

    if (!previousProduct) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    const [updatedProduct] = await db
      .update(schema.product)
      .set({ published: true, updatedAt: new Date() })
      .where(eq(schema.product.id, input.id))
      .returning();

    await createAuditLog({
      action: "publish",
      actor,
      after: toAuditPayload(updatedProduct),
      before: toAuditPayload(previousProduct),
      entityId: updatedProduct.id.toString(),
      entityType: "product",
    });
  } catch (error) {
    throw new Error("Failed to publish product", { cause: error });
  }
}

export const publishProduct = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(publishProductSchema)
  .handler(({ context, data }) => publishHandler(data, getAuditActor(context)));

const unpublishProductSchema = z.object({
  id: z.number().positive(),
});

async function unpublishHandler(input: z.infer<typeof unpublishProductSchema>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [previousProduct] = await db.select().from(schema.product).where(eq(schema.product.id, input.id));

    if (!previousProduct) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    const [updatedProduct] = await db
      .update(schema.product)
      .set({ published: false, updatedAt: new Date() })
      .where(eq(schema.product.id, input.id))
      .returning();

    await createAuditLog({
      action: "unpublish",
      actor,
      after: toAuditPayload(updatedProduct),
      before: toAuditPayload(previousProduct),
      entityId: updatedProduct.id.toString(),
      entityType: "product",
    });
  } catch (error) {
    throw new Error("Failed to unpublish product", { cause: error });
  }
}

export const unpublishProduct = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(unpublishProductSchema)
  .handler(({ context, data }) => unpublishHandler(data, getAuditActor(context)));

const getSelectProductsInput = z.object({
  search: z.string().trim().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

async function getSelectProductsHandler(input: z.infer<typeof getSelectProductsInput>) {
  const search = input.search;
  const limit = input.limit ?? 20;

  const baseQuery = db
    .select({ value: sql<string>`cast(${schema.product.id} as text)`, label: schema.product.name })
    .from(schema.product);

  const filteredQuery = search ? baseQuery.where(ilike(schema.product.name, `%${search}%`)) : baseQuery;

  const products = await filteredQuery.orderBy(schema.product.name).limit(limit);

  return products;
}

export const getSelectProducts = createServerFn()
  .middleware([readMiddleware])
  .inputValidator(getSelectProductsInput)
  .handler(({ data }) => getSelectProductsHandler(data));
