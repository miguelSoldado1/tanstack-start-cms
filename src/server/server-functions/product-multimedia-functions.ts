import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { env } from "env";
import z from "zod";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";

const getProductMultimediaInput = z.object({ productId: z.number() });

async function getAllByIdHandler(input: z.infer<typeof getProductMultimediaInput>) {
  return await db.query.productMultimedia.findMany({
    where: eq(schema.productMultimedia.productId, input.productId),
    orderBy: [asc(schema.productMultimedia.order)],
  });
}

export const getProductMultimediaById = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(getProductMultimediaInput)
  .handler(({ data }) => getAllByIdHandler(data));

const createProductMultimediaInput = z.object({
  multimedia: z.array(z.object({ objectKey: z.string() })),
  productId: z.number(),
});

async function createHandler(input: z.infer<typeof createProductMultimediaInput>) {
  await db.transaction(async (tx) => {
    const lastImage = await tx.query.productMultimedia.findFirst({
      where: eq(schema.productMultimedia.productId, input.productId),
      orderBy: [desc(schema.productMultimedia.order)],
      columns: { order: true },
    });

    const nextOrder = lastImage ? lastImage.order + 1 : 1;
    await tx.insert(schema.productMultimedia).values(
      input.multimedia.map((media, index) => ({
        url: `https://f003.backblazeb2.com/file/${env.BACKBLAZE_BUCKET_NAME}/${media.objectKey}`,
        productId: input.productId,
        order: nextOrder + index,
      }))
    );
  });
}

export const createProductMultimedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createProductMultimediaInput)
  .handler(({ data }) => createHandler(data));

const deleteProductMultimediaInput = z.object({
  id: z.number(),
});

async function deleteHandler(input: z.infer<typeof deleteProductMultimediaInput>) {
  try {
    const existingImage = await db.query.productMultimedia.findFirst({
      where: eq(schema.productMultimedia.id, input.id),
    });

    if (!existingImage) {
      throw new Error(`Image with id ${input.id} not found`);
    }

    await db.delete(schema.productMultimedia).where(eq(schema.productMultimedia.id, input.id));
  } catch (error) {
    throw new Error("Failed to delete product multimedia", { cause: error });
  }
}

export const deleteProductMultimedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteProductMultimediaInput)
  .handler(({ data }) => deleteHandler(data));

const reorderProductMultimediaInput = z.object({
  productId: z.number(),
  newOrderIds: z.array(z.number()),
});

async function updateOrderHandler(input: z.infer<typeof reorderProductMultimediaInput>) {
  if (input.newOrderIds.length === 0) return;

  const caseStatements = input.newOrderIds.map((id, idx) => `WHEN id = ${id} THEN ${idx + 1}`).join(" ");
  const idList = input.newOrderIds.join(",");
  const updatedAt = new Date().toISOString();

  await db.execute(
    `UPDATE product_multimedia
      SET "order" = CASE ${caseStatements} END,
          "updated_at" = '${updatedAt}'
      WHERE product_id = ${input.productId} AND id IN (${idList});`
  );
}

export const reorderProductMultimedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(reorderProductMultimediaInput)
  .handler(({ data }) => updateOrderHandler(data));
