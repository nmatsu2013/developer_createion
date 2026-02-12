import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID文字列
  name: text("name").notNull(),
  email: text("email").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(), // ISO文字列で簡略化
  updatedAt: text("updated_at").notNull(),
})