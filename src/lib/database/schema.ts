import { relations } from "drizzle-orm";
import { boolean, decimal, index, integer, jsonb, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export * from "../auth/auth-schema";

type JsonValue = boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue };
interface JsonObject {
  [key: string]: JsonValue;
}

export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productCategory = pgTable(
  "product_category",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => product.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: integer("category_id")
      .references(() => category.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.productId, t.categoryId)]
);

export const productCategoryRelations = relations(productCategory, ({ one }) => ({
  product: one(product, { fields: [productCategory.productId], references: [product.id] }),
  category: one(category, { fields: [productCategory.categoryId], references: [category.id] }),
}));

export const productBundle = pgTable(
  "product_bundle",
  {
    id: serial("id").primaryKey(),
    primaryProductId: integer("primary_product_id")
      .references(() => product.id, { onDelete: "cascade" })
      .notNull(),
    bundledProductId: integer("bundled_product_id")
      .references(() => product.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.primaryProductId, t.bundledProductId)]
);

export const productBundleRelations = relations(productBundle, ({ one }) => ({
  primaryProduct: one(product, { fields: [productBundle.primaryProductId], references: [product.id] }),
  bundledProduct: one(product, { fields: [productBundle.bundledProductId], references: [product.id] }),
}));

export const productMultimedia = pgTable("product_multimedia", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => product.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productMultimediaRelations = relations(productMultimedia, ({ one }) => ({
  product: one(product, { fields: [productMultimedia.productId], references: [product.id] }),
}));

export const productRelations = relations(product, ({ many }) => ({
  categories: many(productCategory),
  multimedia: many(productMultimedia),
}));

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id"),
    before: jsonb("before").$type<JsonObject | null>(),
    after: jsonb("after").$type<JsonObject | null>(),
    metadata: jsonb("metadata").$type<JsonObject | null>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_log_entity_type_idx").on(t.entityType),
    index("audit_log_entity_id_idx").on(t.entityId),
    index("audit_log_action_idx").on(t.action),
    index("audit_log_actor_user_id_idx").on(t.actorUserId),
    index("audit_log_created_at_idx").on(t.createdAt),
  ]
);
