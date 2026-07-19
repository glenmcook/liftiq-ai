import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const dietProfilesTable = pgTable("diet_profiles", {
  id: serial("id").primaryKey(),
  dietaryPreference: text("dietary_preference").default("omnivore"), // omnivore, vegetarian, vegan, pescatarian, keto, paleo
  allergies: text("allergies"), // free text e.g. "dairy, gluten"
  calorieOverride: integer("calorie_override"),  // optional manual override
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DietProfile = typeof dietProfilesTable.$inferSelect;
