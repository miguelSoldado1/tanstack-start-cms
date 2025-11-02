import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  project: ["read", "write"],
} as const;

export const ac = createAccessControl(statement);

const admin = ac.newRole({
  ...adminAc.statements,
  project: ["read", "write"],
});

const write = ac.newRole({
  project: ["write", "read"],
});

const read = ac.newRole({
  project: ["read"],
});

export const roles = { admin, write, read };
