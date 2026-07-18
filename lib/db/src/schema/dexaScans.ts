import { pgTable, serial, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dexaScansTable = pgTable("dexa_scans", {
  id: serial("id").primaryKey(),
  scanDate: text("scan_date").notNull(), // ISO date string YYYY-MM-DD
  bodyFatPercent: real("body_fat_percent"),
  leanMassLbs: real("lean_mass_lbs"),
  fatMassLbs: real("fat_mass_lbs"),
  boneDensity: real("bone_density"),
  totalWeightLbs: real("total_weight_lbs"),
  visceralFatLevel: real("visceral_fat_level"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDexaScanSchema = createInsertSchema(dexaScansTable).omit({ id: true, createdAt: true });
export type InsertDexaScan = z.infer<typeof insertDexaScanSchema>;
export type DexaScan = typeof dexaScansTable.$inferSelect;
