import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const dietRecommendationsTable = pgTable("diet_recommendations", {
  id: serial("id").primaryKey(),
  data: text("data").notNull(), // JSON stringified recommendations
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
