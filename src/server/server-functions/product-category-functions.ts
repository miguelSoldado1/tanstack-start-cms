import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { readMiddleware, writeMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { createAuditLog, getAuditActor, toAuditPayload } from "@/server/audit";

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
  .middleware([readMiddleware])
  .inputValidator(getAllProductCategoriesInput)
  .handler(({ data }) => getAllHandler(data));

const createProductCategoryInput = z.object({
  productId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

async function createHandler(input: z.infer<typeof createProductCategoryInput>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [existingProduct] = await db
      .select({ id: schema.product.id })
      .from(schema.product)
      .where(eq(schema.product.id, input.productId));

    if (!existingProduct) {
      throw new Error(`Product with id ${input.productId} not found`);
    }

    const [relation] = await db
      .insert(schema.productCategory)
      .values({ categoryId: input.categoryId, productId: input.productId })
      .returning();

    await createAuditLog({
      action: "create",
      actor,
      after: toAuditPayload(relation),
      entityId: relation.id.toString(),
      entityType: "productCategory",
    });
  } catch (error) {
    throw new Error("Failed to create product category", { cause: error });
  }
}

export const createProductCategory = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(createProductCategoryInput)
  .handler(({ context, data }) => createHandler(data, getAuditActor(context)));

const deleteProductCategorySchema = z.object({
  id: z.number().positive(),
  productId: z.number().positive(),
});

async function deleteHandler(input: z.infer<typeof deleteProductCategorySchema>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [deletedRelation] = await db
      .delete(schema.productCategory)
      .where(and(eq(schema.productCategory.id, input.id), eq(schema.productCategory.productId, input.productId)))
      .returning();

    if (!deletedRelation) {
      throw new Error(`Product category with id ${input.id} not found`);
    }

    await createAuditLog({
      action: "delete",
      actor,
      before: toAuditPayload(deletedRelation),
      entityId: deletedRelation.id.toString(),
      entityType: "productCategory",
    });
  } catch (error) {
    throw new Error("Failed to delete product category", { cause: error });
  }
}

export const deleteProductCategory = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(deleteProductCategorySchema)
  .handler(({ context, data }) => deleteHandler(data, getAuditActor(context)));
