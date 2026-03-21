import { createServerFn } from "@tanstack/react-start";
import { asc, eq, sql } from "drizzle-orm";
import z from "zod";
import { readMiddleware, writeMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";
import { deleteBackblazeObject, getBackblazeObjectKey, getBackblazeObjectUrl } from "@/lib/storage/backblaze";
import { createAuditLog, getAuditActor, toAuditPayload } from "@/server/audit";

const getProductMultimediaInput = z.object({ productId: z.number() });

async function getAllByIdHandler(input: z.infer<typeof getProductMultimediaInput>) {
  return await db.query.productMultimedia.findMany({
    where: eq(schema.productMultimedia.productId, input.productId),
    orderBy: [asc(schema.productMultimedia.order)],
  });
}

export const getProductMultimediaById = createServerFn()
  .middleware([readMiddleware])
  .inputValidator(getProductMultimediaInput)
  .handler(({ data }) => getAllByIdHandler(data));

const createProductMultimediaInput = z.object({
  multimedia: z.array(z.object({ objectKey: z.string() })),
  productId: z.number(),
});

async function createHandler(input: z.infer<typeof createProductMultimediaInput>, actor: ReturnType<typeof getAuditActor>) {
  const urls = input.multimedia.map((media) => getBackblazeObjectUrl(media.objectKey));

  await db.execute(
    sql`
      WITH product_lock AS (
        SELECT pg_advisory_xact_lock(${input.productId})
      ),
      next_order AS (
        SELECT COALESCE(MAX("order"), 0) AS base_order
        FROM "product_multimedia"
        WHERE "product_id" = ${input.productId}
      )
      INSERT INTO "product_multimedia" ("product_id", "url", "order")
      SELECT
        ${input.productId},
        url_rows.url,
        (next_order.base_order + url_rows.ordinality)::integer
      FROM product_lock
      CROSS JOIN next_order
      CROSS JOIN jsonb_array_elements_text(${JSON.stringify(urls)}::jsonb) WITH ORDINALITY AS url_rows(url, ordinality);
    `
  );

  await createAuditLog({
    action: "create",
    actor,
    entityId: input.productId.toString(),
    entityType: "productMultimedia",
    metadata: {
      objectKeys: input.multimedia.map((media) => media.objectKey),
      productId: input.productId,
      urls,
    },
  });
}

export const createProductMultimedia = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(createProductMultimediaInput)
  .handler(({ context, data }) => createHandler(data, getAuditActor(context)));

const deleteProductMultimediaInput = z.object({
  id: z.number(),
});

async function deleteHandler(input: z.infer<typeof deleteProductMultimediaInput>, actor: ReturnType<typeof getAuditActor>) {
  try {
    const [deletedImage] = await db
      .delete(schema.productMultimedia)
      .where(eq(schema.productMultimedia.id, input.id))
      .returning();

    if (!deletedImage) {
      throw new Error(`Image with id ${input.id} not found`);
    }

    await createAuditLog({
      action: "delete",
      actor,
      before: toAuditPayload(deletedImage),
      entityId: deletedImage.id.toString(),
      entityType: "productMultimedia",
      metadata: { productId: deletedImage.productId },
    });

    const objectKey = getBackblazeObjectKey(deletedImage.url);
    if (!objectKey) {
      return;
    }

    await deleteBackblazeObject(objectKey);
  } catch (error) {
    throw new Error("Failed to delete product multimedia", { cause: error });
  }
}

export const deleteProductMultimedia = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(deleteProductMultimediaInput)
  .handler(({ context, data }) => deleteHandler(data, getAuditActor(context)));

const reorderProductMultimediaInput = z.object({
  productId: z.number(),
  newOrderIds: z.array(z.number()),
});

async function updateOrderHandler(
  input: z.infer<typeof reorderProductMultimediaInput>,
  actor: ReturnType<typeof getAuditActor>
) {
  if (input.newOrderIds.length === 0) return;

  const updatedAt = new Date().toISOString();

  await db.execute(
    sql`
      WITH product_lock AS (
        SELECT pg_advisory_xact_lock(${input.productId})
      ),
      ordered_ids AS (
        SELECT
          (value)::integer AS id,
          ordinality::integer AS sort_order
        FROM jsonb_array_elements_text(${JSON.stringify(input.newOrderIds)}::jsonb) WITH ORDINALITY
      )
      UPDATE "product_multimedia" AS multimedia
      SET
        "order" = ordered_ids.sort_order,
        "updated_at" = ${updatedAt}::timestamp
      FROM product_lock
      CROSS JOIN ordered_ids
      WHERE multimedia."product_id" = ${input.productId}
        AND multimedia."id" = ordered_ids.id;
    `
  );

  await createAuditLog({
    action: "reorder",
    actor,
    entityId: input.productId.toString(),
    entityType: "productMultimedia",
    metadata: {
      newOrderIds: input.newOrderIds,
      productId: input.productId,
    },
  });
}

export const reorderProductMultimedia = createServerFn({ method: "POST" })
  .middleware([writeMiddleware])
  .inputValidator(reorderProductMultimediaInput)
  .handler(({ context, data }) => updateOrderHandler(data, getAuditActor(context)));
