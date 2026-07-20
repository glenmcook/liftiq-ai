import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, checkinsTable, userProfilesTable, workoutSessionsTable, dexaScansTable, workoutDaysTable } from "@workspace/db";
import { CreateCheckinBody, CreateCheckinResponse, ListCheckinsResponse } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { aiRateLimit } from "../middlewares/aiRateLimit";

const router: IRouter = Router();

router.get("/checkins", async (_req, res): Promise<void> => {
  const checkins = await db
    .select()
    .from(checkinsTable)
    .orderBy(desc(checkinsTable.checkinDate));

  const result = checkins.map(c => ({
    id: c.id,
    checkinDate: c.checkinDate.toISOString(),
    userNotes: c.userNotes ?? null,
    aiResponse: c.aiResponse,
    recommendedChanges: c.recommendedChanges ?? null,
    feelingScore: c.feelingScore ?? null,
  }));

  res.json(ListCheckinsResponse.parse(result));
});

router.post("/checkins", aiRateLimit, async (req, res): Promise<void> => {
  const body = CreateCheckinBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // Gather context for AI
  const [profile] = await db.select().from(userProfilesTable).limit(1);
  const recentSessions = await db
    .select({ session: workoutSessionsTable, day: workoutDaysTable })
    .from(workoutSessionsTable)
    .leftJoin(workoutDaysTable, eq(workoutSessionsTable.dayId, workoutDaysTable.id))
    .orderBy(desc(workoutSessionsTable.startedAt))
    .limit(5);
  const [latestDexa] = await db
    .select()
    .from(dexaScansTable)
    .orderBy(desc(dexaScansTable.scanDate))
    .limit(1);

  const profileSummary = profile
    ? `User: ${profile.age}yo ${profile.gender}, goal: ${profile.fitnessGoal}, level: ${profile.experienceLevel}, ${profile.daysPerWeek} days/week. Activities: ${profile.currentActivities ?? "none listed"}.`
    : "No profile set up yet.";

  const dexaSummary = latestDexa
    ? `Latest DEXA (${latestDexa.scanDate}): ${latestDexa.bodyFatPercent}% body fat, ${latestDexa.leanMassLbs}lbs lean mass.`
    : "No DEXA data available.";

  const sessionCount = recentSessions.length;
  const feeling = body.data.feelingScore ? `Feeling score: ${body.data.feelingScore}/10.` : "";
  const userNotes = body.data.userNotes ? `User notes: ${body.data.userNotes}` : "";

  const prompt = `You are a world-class personal trainer and nutrition coach doing a check-in with your athlete.

Context:
${profileSummary}
${dexaSummary}
Recent sessions completed: ${sessionCount}
${feeling}
${userNotes}

Provide a motivating, personalized check-in response (2-3 paragraphs). Include:
1. Assessment of their progress based on the data
2. Specific, actionable adjustments to their workout plan if needed
3. Nutrition or recovery tips relevant to their goal

Be direct, specific, and encouraging. Speak like a coach who knows their athlete.`;

  let aiResponse = "";
  let recommendedChanges = "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    aiResponse = completion.choices[0]?.message?.content ?? "Unable to generate response.";

    // Extract recommended changes
    const changesPrompt = `Based on this check-in response, list 2-3 specific workout changes as bullet points:\n\n${aiResponse}`;
    const changesCompletion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 200,
      messages: [{ role: "user", content: changesPrompt }],
    });
    recommendedChanges = changesCompletion.choices[0]?.message?.content ?? "";
  } catch (err) {
    req.log.error({ err }, "OpenAI call failed");
    aiResponse = "Check-in recorded. Keep pushing — consistency is the key to progress.";
  }

  const [checkin] = await db
    .insert(checkinsTable)
    .values({
      userNotes: body.data.userNotes ?? null,
      aiResponse,
      recommendedChanges: recommendedChanges || null,
      feelingScore: body.data.feelingScore ?? null,
    })
    .returning();

  res.status(201).json(CreateCheckinResponse.parse({
    id: checkin.id,
    checkinDate: checkin.checkinDate.toISOString(),
    userNotes: checkin.userNotes ?? null,
    aiResponse: checkin.aiResponse,
    recommendedChanges: checkin.recommendedChanges ?? null,
    feelingScore: checkin.feelingScore ?? null,
  }));
});

export default router;
