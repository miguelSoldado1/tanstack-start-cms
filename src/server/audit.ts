import { db } from "@/lib/database/drizzle";
import { auditLog } from "@/lib/database/schema";

export type AuditAction = "create" | "delete" | "publish" | "reorder" | "unpublish" | "update";

export interface AuditActor {
  userId: string | null;
}

export type AuditValue = boolean | null | number | string | AuditValue[] | { [key: string]: AuditValue };
export interface AuditPayload {
  [key: string]: AuditValue;
}

interface SessionLike {
  user?: {
    id?: string | null;
  } | null;
}

export function getAuditActor(context: unknown): AuditActor {
  const session = (context ?? null) as SessionLike | null;

  return {
    userId: session?.user?.id ?? null,
  };
}

interface CreateAuditLogInput {
  action: AuditAction;
  actor: AuditActor;
  after?: AuditPayload | null;
  before?: AuditPayload | null;
  entityId: string;
  entityType: string;
  metadata?: AuditPayload | null;
}

export async function createAuditLog({
  action,
  actor,
  after = null,
  before = null,
  entityId,
  entityType,
  metadata = null,
}: CreateAuditLogInput) {
  const values: typeof auditLog.$inferInsert = {
    action,
    actorUserId: actor.userId,
    after: after as typeof auditLog.$inferInsert.after,
    before: before as typeof auditLog.$inferInsert.before,
    entityId,
    entityType,
    metadata: metadata as typeof auditLog.$inferInsert.metadata,
  };

  await db.insert(auditLog).values(values);
}

export function toAuditPayload(value: unknown): AuditPayload {
  return JSON.parse(JSON.stringify(value ?? {})) as AuditPayload;
}
