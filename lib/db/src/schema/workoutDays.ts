import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workoutPlansTable } from "./workoutPlans";

export const workoutDaysTable = pgTable("workout_days", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => workoutPlansTable.id),
  dayNumber: integer("day_number").notNull(),
  label: text("label").notNull(), // e.g. "Pull (Heavy)", "Push (Light)", "Legs"
  focus: text("focus").notNull(), // pull, push, legs, full_body, cardio, rest
  restSeconds: integer("rest_seconds").notNull().default(120),
  notes: text("notes"),
});

export const insertWorkoutDaySchema = createInsertSchema(workoutDaysTable).omit({ id: true });
export type InsertWorkoutDay = z.infer<typeof insertWorkoutDaySchema>;
export type WorkoutDay = typeof workoutDaysTable.$inferSelect;
