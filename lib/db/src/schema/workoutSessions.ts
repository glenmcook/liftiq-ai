import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workoutDaysTable } from "./workoutDays";

export const workoutSessionsTable = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull().references(() => workoutDaysTable.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessionsTable).omit({ id: true, startedAt: true });
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type WorkoutSession = typeof workoutSessionsTable.$inferSelect;
