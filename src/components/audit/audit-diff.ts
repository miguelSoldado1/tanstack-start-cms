import type { AuditPayload, AuditValue } from "@/server/audit";

export interface AuditDiffEntry {
  after: AuditValue | undefined;
  before: AuditValue | undefined;
  path: string;
}

function isPlainObject(value: AuditValue | undefined): value is AuditPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function areEqual(left: AuditValue | undefined, right: AuditValue | undefined) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function getAuditDiffEntries(before: AuditPayload | null, after: AuditPayload | null): AuditDiffEntry[] {
  if (!(before || after)) {
    return [];
  }

  function walk(left: AuditValue | undefined, right: AuditValue | undefined, path: string): AuditDiffEntry[] {
    if (areEqual(left, right)) {
      return [];
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
      const children = [...keys].flatMap((key) => walk(left[key], right[key], path ? `${path}.${key}` : key));
      if (children.length > 0) {
        return children;
      }
    }

    return [{ after: right, before: left, path: path || "root" }];
  }

  return walk(before ?? undefined, after ?? undefined, "");
}
