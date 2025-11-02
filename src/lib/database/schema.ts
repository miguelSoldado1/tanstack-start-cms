import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export * from "../auth/auth-schema";

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
