import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const LOCATIONS = ["Alacena", "Refrigerador", "Congelador"] as const;
export const UNITS = ["unid", "paquete", "kg", "g", "L", "ml"] as const;

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode"),
  location: text("location").notNull().default("Alacena"),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("unid"),
  minStock: integer("min_stock").notNull().default(1),
  expiresAt: date("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
