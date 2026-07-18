import { pgTable, serial, integer, real, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workoutExercisesTable } from "./workoutExercises";

export const prescribedSetsTable = pgTable("prescribed_sets", {
  id: serial("id").primaryKey(),
  workoutExerciseId: integer("workout_exercise_id").notNull().references(() => workoutExercisesTable.id),
  setNumber: integer("set_number").notNull(),
  targetWeightLbs: real("target_weight_lbs"),
  targetRepsMin: integer("target_reps_min").notNull(),
  targetRepsMax: integer("target_reps_max").notNull(),
  restSeconds: integer("rest_seconds").notNull().default(120),
  notes: text("notes"),
});

export const insertPrescribedSetSchema = createInsertSchema(prescribedSetsTable).omit({ id: true });
export type InsertPrescribedSet = z.infer<typeof insertPrescribedSetSchema>;
export type PrescribedSet = typeof prescribedSetsTable.$inferSelect;
