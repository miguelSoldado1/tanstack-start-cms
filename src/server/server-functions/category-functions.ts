import { createServerFn } from "@tanstack/react-start";
import { count, eq, ilike, sql } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { buildQueryParams, getTableDataInput, type TableQueryConfig } from "../table-query";

const SORT_COLUMNS = {
  createdAt: schema.category.createdAt,
  updatedAt: schema.category.updatedAt,
} as const;

const FILTER_COLUMNS = {
  id: schema.category.id,
  name: schema.category.name,
  createdAt: schema.category.createdAt,
  updatedAt: schema.category.updatedAt,
} as const;

const CONFIG: TableQueryConfig<typeof SORT_COLUMNS, typeof FILTER_COLUMNS> = {
  sortColumns: SORT_COLUMNS,
  filterColumns: FILTER_COLUMNS,
  dateColumns: new Set(["createdAt", "updatedAt"]),
  textColumns: new Set(["name"]),
  numberColumns: new Set(["id"]),
} as const;

async function getTableHandler(input: z.infer<typeof getTableDataInput>) {
  // Build query parameters using the reusable utility
  const queryParams = buildQueryParams(input, CONFIG);

  // Build queries
  const baseQuery = db.select().from(schema.category);
  const filterQuery = queryParams.whereClause ? baseQuery.where(queryParams.whereClause) : baseQuery;
  const sortedQuery = queryParams.orderBy.length > 0 ? filterQuery.orderBy(...queryParams.orderBy) : filterQuery;

  const [data, totalCount] = await Promise.all([
    sortedQuery.limit(queryParams.limit).offset(queryParams.offset),
    db.select({ count: count() }).from(schema.category).where(queryParams.whereClause),
  ]);

  return {
    data,
    pageCount: Math.ceil(totalCount[0].count / queryParams.limit),
  };
}

export const getTableCategories = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getTableDataInput)
  .handler(({ data }) => getTableHandler(data));

const selectCategoryInput = z.object({
  search: z.string().optional(),
});

async function getSelectCategoriesHandler(input: z.infer<typeof selectCategoryInput>) {
  const search = input.search?.trim();

  const baseQuery = db
    .select({
      value: sql<string>`cast(${schema.category.id} as text)`,
      label: schema.category.name,
    })
    .from(schema.category);

  const filteredQuery = search ? baseQuery.where(ilike(schema.category.name, `%${search}%`)) : baseQuery;

  const categories = await filteredQuery.orderBy(schema.category.name);

  return categories;
}

export const getSelectCategories = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(selectCategoryInput)
  .handler(({ data }) => getSelectCategoriesHandler(data));

const getCategorySchema = z.object({ id: z.number().positive() });

async function getFirstHandler(input: z.infer<typeof getCategorySchema>) {
  const [category] = await db.select().from(schema.category).where(eq(schema.category.id, input.id)).limit(1).execute();
  if (!category) {
    throw new Error(`Category with id ${input.id} not found`);
  }

  return category;
}

export const getCategory = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getCategorySchema)
  .handler(({ data }) => getFirstHandler(data));

const deleteCategorySchema = z.object({ id: z.number().positive() });

async function deleteHandler(input: z.infer<typeof deleteCategorySchema>) {
  try {
    const [existingCategory] = await db
      .select({ id: schema.category.id })
      .from(schema.category)
      .where(eq(schema.category.id, input.id));

    if (!existingCategory) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    await db.delete(schema.category).where(eq(schema.category.id, input.id));
  } catch (error) {
    throw new Error("Failed to update category", { cause: error });
  }
}

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteCategorySchema)
  .handler(({ data }) => deleteHandler(data));

const createCategoryInput = z.object({
  name: z.string().min(2).max(100),
});

async function createHandler(input: z.infer<typeof createCategoryInput>) {
  try {
    const [category] = await db.insert(schema.category).values(input).returning({ id: schema.category.id });
    return category.id;
  } catch (error) {
    throw new Error("Failed to create category", { cause: error });
  }
}

export const createCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createCategoryInput)
  .handler(({ data }) => createHandler(data));

const updateCategorySchema = z.object({
  id: z.number().positive(),
  name: z.string().min(2).max(100),
});

async function updateHandler(input: z.infer<typeof updateCategorySchema>) {
  try {
    const [existingCategory] = await db
      .select({ id: schema.category.id })
      .from(schema.category)
      .where(eq(schema.category.id, input.id));

    if (!existingCategory) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    await db
      .update(schema.category)
      .set({ name: input.name, updatedAt: new Date() })
      .where(eq(schema.category.id, input.id));
  } catch (error) {
    throw new Error("Failed to update category", { cause: error });
  }
}

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateCategorySchema)
  .handler(({ data }) => updateHandler(data));
