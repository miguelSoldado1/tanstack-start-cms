import { createServerFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import * as schema from "@/lib/database/schema";

async function getSelectCategoriesHandler() {
  const categories = await db
    .select({
      value: sql<string>`cast(${schema.category.id} as text)`,
      label: schema.category.name,
    })
    .from(schema.category)
    .orderBy(schema.category.name);

  return categories;
}

export const getSelectCategories = createServerFn().middleware([authMiddleware]).handler(getSelectCategoriesHandler);
