import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  muscleGroup: text("muscle_group").notNull(), // back, chest, shoulders, biceps, triceps, legs, core, cardio
  category: text("category").notNull(), // compound, isolation, cardio, bodyweight
  equipment: text("equipment"),
  videoUrl: text("video_url"),
  instructions: text("instructions"),
});

export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({ id: true });
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercisesTable.$inferSelect;
