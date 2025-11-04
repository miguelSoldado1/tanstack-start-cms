import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";

const getAllProductCategoriesInput = z.object({ productId: z.number() });

async function getAllHandler(input: z.infer<typeof getAllProductCategoriesInput>) {
  const categories = await db
    .select({
      id: schema.productCategory.id,
      categoryId: schema.productCategory.categoryId,
      productId: schema.productCategory.productId,
      name: schema.category.name,
      createdAt: schema.productCategory.createdAt,
      updatedAt: schema.productCategory.updatedAt,
    })
    .from(schema.productCategory)
    .innerJoin(schema.category, eq(schema.category.id, schema.productCategory.categoryId))
    .where(eq(schema.productCategory.productId, input.productId));

  return categories;
}

export const getAllProductCategories = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getAllProductCategoriesInput)
  .handler(({ data }) => getAllHandler(data));

const createProductCategoryInput = z.object({
  productId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

async function createHandler(input: z.infer<typeof createProductCategoryInput>) {
  try {
    const [existingProduct] = await db
      .select({ id: schema.product.id })
      .from(schema.product)
      .where(eq(schema.product.id, input.productId));

    if (!existingProduct) {
      throw new Error(`Product with id ${input.productId} not found`);
    }

    await db.insert(schema.productCategory).values({ productId: input.productId, categoryId: input.categoryId });
  } catch (error) {
    throw new Error("Failed to create product category", { cause: error });
  }
}

export const createProductCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createProductCategoryInput)
  .handler(({ data }) => createHandler(data));

const deleteProductCategorySchema = z.object({
  id: z.number().positive(),
  productId: z.number().positive(),
});

async function deleteHandler(input: z.infer<typeof deleteProductCategorySchema>) {
  try {
    const [existingProductCategory] = await db
      .select({ id: schema.productCategory.id })
      .from(schema.productCategory)
      .where(and(eq(schema.productCategory.id, input.id), eq(schema.productCategory.productId, input.productId)));

    if (!existingProductCategory) {
      throw new Error(`Product category with id ${input.id} not found`);
    }

    await db
      .delete(schema.productCategory)
      .where(and(eq(schema.productCategory.id, input.id), eq(schema.productCategory.productId, input.productId)));
  } catch (error) {
    throw new Error("Failed to delete product category", { cause: error });
  }
}

export const deleteProductCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteProductCategorySchema)
  .handler(({ data }) => deleteHandler(data));
