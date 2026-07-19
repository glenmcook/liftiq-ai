import { Router, type IRouter } from "express";
import { db, userProfilesTable, dietProfilesTable, dietRecommendationsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcMacros(profile: {
  weightLbs: number | null;
  heightInches: number | null;
  age: number | null;
  gender: string | null;
  fitnessGoal: string | null;
  daysPerWeek: number | null;
  calorieOverride: number | null;
}) {
  const weightKg = (profile.weightLbs ?? 180) * 0.453592;
  const heightCm = (profile.heightInches ?? 70) * 2.54;
  const age = profile.age ?? 30;
  const isFemale = profile.gender?.toLowerCase() === "female";

  // Mifflin-St Jeor BMR
  const bmr = isFemale
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  // Activity multiplier based on training days
  const days = profile.daysPerWeek ?? 4;
  const activityFactor =
    days <= 1 ? 1.2 : days <= 3 ? 1.375 : days <= 5 ? 1.55 : 1.725;

  let tdee = bmr * activityFactor;

  // Goal adjustment
  const goal = profile.fitnessGoal ?? "build_muscle";
  if (goal === "lose_fat") tdee -= 500;
  else if (goal === "build_muscle") tdee += 300;

  const calories = Math.round(profile.calorieOverride ?? tdee);

  // Macro splits by goal
  let proteinPct = 0.30, carbsPct = 0.45, fatPct = 0.25;
  if (goal === "lose_fat")      { proteinPct = 0.40; carbsPct = 0.30; fatPct = 0.30; }
  else if (goal === "build_muscle") { proteinPct = 0.30; carbsPct = 0.50; fatPct = 0.20; }

  return {
    calories,
    proteinG: Math.round((calories * proteinPct) / 4),
    carbsG:   Math.round((calories * carbsPct)   / 4),
    fatG:     Math.round((calories * fatPct)      / 9),
    goal,
  };
}

// ─── GET /diet/preferences ───────────────────────────────────────────────────

router.get("/diet/preferences", async (_req, res): Promise<void> => {
  const [pref] = await db.select().from(dietProfilesTable).limit(1);
  res.json(pref ?? { dietaryPreference: "omnivore", allergies: null, calorieOverride: null });
});

// ─── POST /diet/preferences ──────────────────────────────────────────────────

router.post("/diet/preferences", async (req, res): Promise<void> => {
  const { dietaryPreference, allergies, calorieOverride } = req.body ?? {};
  const data: Record<string, any> = { updatedAt: new Date() };
  if (dietaryPreference !== undefined) data.dietaryPreference = String(dietaryPreference);
  if (allergies !== undefined) data.allergies = allergies ?? null;
  if (calorieOverride !== undefined) data.calorieOverride = calorieOverride ? Number(calorieOverride) : null;

  const [existing] = await db.select().from(dietProfilesTable).limit(1);
  if (existing) {
    const [updated] = await db.update(dietProfilesTable).set(data).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(dietProfilesTable).values(data).returning();
    res.json(created);
  }
});

// ─── GET /diet/recommendations ───────────────────────────────────────────────

router.get("/diet/recommendations", async (req, res): Promise<void> => {
  const refresh = req.query.refresh === "true";

  // Serve from cache unless forced refresh
  if (!refresh) {
    const [cached] = await db.select().from(dietRecommendationsTable).limit(1);
    if (cached) {
      res.json(JSON.parse(cached.data));
      return;
    }
  }

  const [profile] = await db.select().from(userProfilesTable).limit(1);
  const [prefs]   = await db.select().from(dietProfilesTable).limit(1);

  const macros = calcMacros({
    weightLbs:      profile?.weightLbs ?? null,
    heightInches:   profile?.heightInches ?? null,
    age:            profile?.age ?? null,
    gender:         profile?.gender ?? null,
    fitnessGoal:    profile?.fitnessGoal ?? null,
    daysPerWeek:    profile?.daysPerWeek ?? null,
    calorieOverride: prefs?.calorieOverride ?? null,
  });

  const dietPref   = prefs?.dietaryPreference ?? "omnivore";
  const allergies  = prefs?.allergies ?? "none";
  const goal       = profile?.fitnessGoal ?? "build_muscle";
  const activities = profile?.currentActivities ?? "";
  const experience = profile?.experienceLevel ?? "intermediate";
  const weight     = profile?.weightLbs ?? 180;

  const prompt = `You are a sports nutritionist building a practical daily meal plan for an athlete.

Athlete profile:
- Goal: ${goal.replace("_", " ")}
- Experience: ${experience}
- Weight: ${weight} lbs
- Training days per week: ${profile?.daysPerWeek ?? 4}
- Other activities: ${activities || "none"}
- Dietary preference: ${dietPref}
- Allergies / restrictions: ${allergies}
- Daily targets: ${macros.calories} kcal | ${macros.proteinG}g protein | ${macros.carbsG}g carbs | ${macros.fatG}g fat

Return a JSON object with this exact shape:
{
  "mealPlan": [
    {
      "meal": "Meal name (e.g. Breakfast, Pre-Workout, Lunch, Post-Workout, Dinner, Evening Snack)",
      "time": "Suggested time (e.g. 7:00 AM)",
      "foods": ["food item with rough portion", ...],
      "macros": { "calories": number, "proteinG": number, "carbsG": number, "fatG": number },
      "notes": "1 sentence on why this meal serves the athlete's goal (optional)"
    }
  ],
  "tips": ["practical nutrition tip specific to this athlete", ...] // 3–4 tips
}

Rules:
- Respect dietary preference and allergies strictly.
- Distribute protein evenly across meals.
- Time carbs around training when possible.
- Use real, whole foods — no supplements as primary sources.
- Keep portions practical and measurable (cups, oz, pieces).
- Return ONLY valid JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.6-luna",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const aiData = JSON.parse(response.choices[0].message.content ?? "{}");
  const result = { macros, ...aiData, dietaryPreference: dietPref, allergies };

  // Save to cache
  const [existing] = await db.select().from(dietRecommendationsTable).limit(1);
  if (existing) {
    await db.update(dietRecommendationsTable).set({ data: JSON.stringify(result), updatedAt: new Date() });
  } else {
    await db.insert(dietRecommendationsTable).values({ data: JSON.stringify(result) });
  }

  res.json(result);
});

export default router;
