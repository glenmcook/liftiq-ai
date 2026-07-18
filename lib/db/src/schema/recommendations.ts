import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // supplement, service, equipment, food
  title: text("title").notNull(),
  description: text("description").notNull(),
  brand: text("brand"),
  imageUrl: text("image_url"),
  affiliateUrl: text("affiliate_url"),
  relevanceReason: text("relevance_reason").notNull(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
