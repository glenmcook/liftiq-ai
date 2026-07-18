import { pgTable, serial, integer, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { exercisesTable } from "./exercises";

export const exerciseMaxesTable = pgTable("exercise_maxes", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id),
  maxWeightLbs: real("max_weight_lbs").notNull(),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertExerciseMaxSchema = createInsertSchema(exerciseMaxesTable).omit({ id: true, achievedAt: true });
export type InsertExerciseMax = z.infer<typeof insertExerciseMaxSchema>;
export type ExerciseMax = typeof exerciseMaxesTable.$inferSelect;
