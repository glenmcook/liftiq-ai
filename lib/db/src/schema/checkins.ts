import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  checkinDate: timestamp("checkin_date").defaultNow().notNull(),
  userNotes: text("user_notes"),
  aiResponse: text("ai_response").notNull(),
  recommendedChanges: text("recommended_changes"),
  feelingScore: integer("feeling_score"), // 1-10
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, checkinDate: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
