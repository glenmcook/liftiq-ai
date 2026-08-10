import { Router, type IRouter } from "express";
import { eq, desc, gte } from "drizzle-orm";
import { db, workoutSessionsTable, loggedSetsTable, workoutPlansTable, workoutDaysTable, dexaScansTable, exerciseMaxesTable, exercisesTable, userProfilesTable } from "@workspace/db";
import { GetDashboardSummaryResponse, GetWeightProgressResponse, GetRecommendationsResponse } from "@workspace/api-zod";
import { recommendationsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { aiRateLimit } from "../middlewares/aiRateLimit";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const allSessions = await db
    .select({ session: workoutSessionsTable, day: workoutDaysTable })
    .from(workoutSessionsTable)
    .leftJoin(workoutDaysTable, eq(workoutSessionsTable.dayId, workoutDaysTable.id))
    .orderBy(desc(workoutSessionsTable.startedAt));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const sessionsThisWeek = allSessions.filter(
    ({ session }) => session.startedAt >= oneWeekAgo
  ).length;

  // Current streak: consecutive days with at least one session
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 0; d < 365; d++) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - d);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const hasSession = allSessions.some(({ session }) =>
      session.startedAt >= dayStart && session.startedAt < dayEnd
    );
    if (hasSession) {
      currentStreak++;
    } else if (d > 0) {
      break;
    }
  }

  const [activePlan] = await db
    .select()
    .from(workoutPlansTable)
    .where(eq(workoutPlansTable.isActive, true))
    .limit(1);

  let nextWorkoutDay = null;
  let activePlanDays = 0;
  if (activePlan) {
    const days = await db
      .select()
      .from(workoutDaysTable)
      .where(eq(workoutDaysTable.planId, activePlan.id))
      .orderBy(workoutDaysTable.dayNumber);
    activePlanDays = days.length;

    // Find next day based on last session
    const [lastSession] = allSessions;
    if (lastSession && days.length > 0) {
      const lastDayId = lastSession.session.dayId;
      const lastDayIdx = days.findIndex(d => d.id === lastDayId);
      const nextIdx = (lastDayIdx + 1) % days.length;
      const nd = days[nextIdx];
      nextWorkoutDay = nd ? {
        id: nd.id,
        planId: nd.planId,
        dayNumber: nd.dayNumber,
        label: nd.label,
        focus: nd.focus,
        restSeconds: nd.restSeconds,
        notes: nd.notes ?? null,
      } : null;
    } else if (days.length > 0) {
      const nd = days[0];
      nextWorkoutDay = nd ? {
        id: nd.id,
        planId: nd.planId,
        dayNumber: nd.dayNumber,
        label: nd.label,
        focus: nd.focus,
        restSeconds: nd.restSeconds,
        notes: nd.notes ?? null,
      } : null;
    }
  }

  const recentSessions = allSessions.slice(0, 5).map(({ session, day }) => ({
    id: session.id,
    dayId: session.dayId,
    dayLabel: day?.label ?? "Unknown",
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    notes: session.notes ?? null,
    totalSets: 0,
    completedSets: 0,
  }));

  const allSets = await db.select().from(loggedSetsTable);
  const personalRecords = allSets.filter(s => s.isPersonalRecord).length;

  const [latestDexa] = await db
    .select()
    .from(dexaScansTable)
    .orderBy(desc(dexaScansTable.scanDate))
    .limit(1);

  const summary: Record<string, unknown> = {
    totalSessions: allSessions.length,
    sessionsThisWeek,
    totalSetsLogged: allSets.length,
    currentStreak,
    activePlanName: activePlan?.name ?? null,
    activePlanDays,
    recentSessions,
    personalRecords,
    latestBodyFat: latestDexa?.bodyFatPercent ?? null,
    latestLeanMass: latestDexa?.leanMassLbs ?? null,
  };
  if (nextWorkoutDay) {
    summary.nextWorkoutDay = nextWorkoutDay;
  }
  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/progress/weights", async (req, res): Promise<void> => {
  const exerciseIdParam = req.query.exerciseId;
  const exerciseId = exerciseIdParam ? parseInt(exerciseIdParam as string, 10) : undefined;

  const maxes = await db
    .select({ max: exerciseMaxesTable, exercise: exercisesTable })
    .from(exerciseMaxesTable)
    .leftJoin(exercisesTable, eq(exerciseMaxesTable.exerciseId, exercisesTable.id))
    .orderBy(exerciseMaxesTable.achievedAt);

  const filtered = exerciseId
    ? maxes.filter(({ max }) => max.exerciseId === exerciseId)
    : maxes;

  const result = filtered.map(({ max, exercise }) => ({
    exerciseId: max.exerciseId,
    exerciseName: exercise?.name ?? "Unknown",
    date: max.achievedAt.toISOString().split("T")[0],
    weightLbs: max.maxWeightLbs,
  }));

  res.json(GetWeightProgressResponse.parse(result));
});

router.get("/recommendations", aiRateLimit, async (req, res): Promise<void> => {
  const refresh = req.query.refresh === "true";

  if (!refresh) {
    const existing = await db.select().from(recommendationsTable);
    if (existing.length > 0) {
      res.json(GetRecommendationsResponse.parse(existing));
      return;
    }
  }

  const [profile] = await db.select().from(userProfilesTable).limit(1);
  const [latestScan] = await db
    .select()
    .from(dexaScansTable)
    .orderBy(desc(dexaScansTable.scanDate))
    .limit(1);

  const goal = profile?.fitnessGoal ?? "build_muscle";
  const experience = profile?.experienceLevel ?? "intermediate";
  const activities = profile?.currentActivities ?? "";
  const daysPerWeek = profile?.daysPerWeek ?? 4;

  const prompt = `You are a knowledgeable strength & conditioning coach recommending gear, supplements, and services to an athlete.

Athlete profile:
- Goal: ${goal.replace("_", " ")}
- Experience: ${experience}
- Training days per week: ${daysPerWeek}
- Other activities: ${activities || "none"}
${latestScan ? `- Most recent DEXA scan: body fat ${latestScan.bodyFatPercent ?? "unknown"}%, lean mass ${latestScan.leanMassLbs ?? "unknown"} lbs` : "- No DEXA scan on file yet"}

Recommend exactly 6 real, well-known products or services that would genuinely help this athlete, spanning a mix of these categories: supplement, equipment, service, food. Prefer specific, real, widely-available products/brands over generic descriptions.

Return a JSON object with this exact shape:
{
  "recommendations": [
    {
      "category": "supplement" | "equipment" | "service" | "food",
      "title": "Product or service name",
      "description": "1-2 sentence description of what it is",
      "brand": "Brand name or null",
      "relevanceReason": "1 sentence on why this specifically fits this athlete's profile"
    }
  ]
}

Rules:
- Do NOT invent image URLs or affiliate links — omit those fields entirely.
- Be specific and real (e.g. "Creatine Monohydrate" with brand "Thorne", not "a protein supplement").
- Return ONLY valid JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.6-luna",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const aiData = JSON.parse(response.choices[0].message.content ?? "{}");
  const items: Array<{
    category: string;
    title: string;
    description: string;
    brand?: string | null;
    relevanceReason: string;
  }> = Array.isArray(aiData.recommendations) ? aiData.recommendations : [];

  await db.delete(recommendationsTable);
  const inserted = items.length > 0
    ? await db.insert(recommendationsTable).values(
        items.map((item) => ({
          category: item.category,
          title: item.title,
          description: item.description,
          brand: item.brand ?? null,
          relevanceReason: item.relevanceReason,
        }))
      ).returning()
    : [];

  res.json(GetRecommendationsResponse.parse(inserted));
});

export default router;
