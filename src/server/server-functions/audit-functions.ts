import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";
import { readMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";

const getAuditLogsByEntityInput = z.object({
  entityId: z.string().min(1),
  entityType: z.string().min(1),
});

function getAuditLogsByEntityHandler(input: z.infer<typeof getAuditLogsByEntityInput>) {
  return db
    .select({
      ...getTableColumns(schema.auditLog),
      actorName: schema.user.name,
    })
    .from(schema.auditLog)
    .leftJoin(schema.user, eq(schema.auditLog.actorUserId, schema.user.id))
    .where(and(eq(schema.auditLog.entityType, input.entityType), eq(schema.auditLog.entityId, input.entityId)))
    .orderBy(desc(schema.auditLog.createdAt), desc(schema.auditLog.id));
}

export const getAuditLogsByEntity = createServerFn()
  .middleware([readMiddleware])
  .inputValidator(getAuditLogsByEntityInput)
  .handler(({ data }) => getAuditLogsByEntityHandler(data));
