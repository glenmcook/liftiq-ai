import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workoutDaysTable } from "./workoutDays";
import { exercisesTable } from "./exercises";

export const workoutExercisesTable = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull().references(() => workoutDaysTable.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id),
  groupName: text("group_name").notNull(), // "Lat Movement", "Row Movement", etc.
  pickOne: boolean("pick_one").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercisesTable).omit({ id: true });
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type WorkoutExercise = typeof workoutExercisesTable.$inferSelect;
