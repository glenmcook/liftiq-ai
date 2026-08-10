import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  weightLbs: real("weight_lbs"),
  heightInches: real("height_inches"),
  fitnessGoal: text("fitness_goal").notNull(), // lose_fat, build_muscle, athletic_performance, general_fitness
  experienceLevel: text("experience_level").notNull(), // beginner, intermediate, advanced
  currentActivities: text("current_activities"), // JSON array
  daysPerWeek: integer("days_per_week").notNull().default(3),
  splitPreference: text("split_preference"), // free-text description of desired training split (e.g. "9-day rotation: 3 heavy PPL, 3 moderate PPL, 3 light PPL")
  email: text("email"),
  pushToken: text("push_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
