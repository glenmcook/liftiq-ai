import { pgTable, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workoutSessionsTable } from "./workoutSessions";
import { exercisesTable } from "./exercises";

export const loggedSetsTable = pgTable("logged_sets", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => workoutSessionsTable.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id),
  setNumber: integer("set_number").notNull(),
  actualWeightLbs: real("actual_weight_lbs"),
  actualReps: integer("actual_reps").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  isPersonalRecord: boolean("is_personal_record").notNull().default(false),
});

export const insertLoggedSetSchema = createInsertSchema(loggedSetsTable).omit({ id: true, completedAt: true });
export type InsertLoggedSet = z.infer<typeof insertLoggedSetSchema>;
export type LoggedSet = typeof loggedSetsTable.$inferSelect;
