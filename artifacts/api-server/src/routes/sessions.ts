import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, workoutSessionsTable, loggedSetsTable, exercisesTable, workoutDaysTable, exerciseMaxesTable } from "@workspace/db";
import {
  CreateSessionBody,
  CreateSessionResponse,
  GetSessionParams,
  GetSessionResponse,
  UpdateSessionParams,
  UpdateSessionBody,
  UpdateSessionResponse,
  LogSetParams,
  LogSetBody,
  LogSetResponse,
  ListSessionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions", async (_req, res): Promise<void> => {
  const sessions = await db
    .select({
      session: workoutSessionsTable,
      day: workoutDaysTable,
    })
    .from(workoutSessionsTable)
    .leftJoin(workoutDaysTable, eq(workoutSessionsTable.dayId, workoutDaysTable.id))
    .orderBy(desc(workoutSessionsTable.startedAt));

  const sets = await db.select().from(loggedSetsTable);
  const setsBySession: Record<number, typeof sets> = {};
  for (const s of sets) {
    if (!setsBySession[s.sessionId]) setsBySession[s.sessionId] = [];
    setsBySession[s.sessionId].push(s);
  }

  const result = sessions.map(({ session, day }) => {
    const sessionSets = setsBySession[session.id] ?? [];
    return {
      id: session.id,
      dayId: session.dayId,
      dayLabel: day?.label ?? "Unknown",
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      notes: session.notes ?? null,
      totalSets: sessionSets.length,
      completedSets: sessionSets.length,
    };
  });

  res.json(ListSessionsResponse.parse(result));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [day] = await db
    .select()
    .from(workoutDaysTable)
    .where(eq(workoutDaysTable.id, parsed.data.dayId));

  if (!day) {
    res.status(404).json({ error: "Workout day not found" });
    return;
  }

  const [session] = await db
    .insert(workoutSessionsTable)
    .values({ dayId: parsed.data.dayId })
    .returning();

  res.status(201).json(CreateSessionResponse.parse({
    id: session.id,
    dayId: session.dayId,
    dayLabel: day.label,
    startedAt: session.startedAt.toISOString(),
    completedAt: null,
    notes: null,
    totalSets: 0,
    completedSets: 0,
  }));
});

router.get("/sessions/:sessionId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = GetSessionParams.safeParse({ sessionId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(workoutSessionsTable)
    .where(eq(workoutSessionsTable.id, params.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const [day] = await db.select().from(workoutDaysTable).where(eq(workoutDaysTable.id, session.dayId));

  const loggedSets = await db
    .select({ set: loggedSetsTable, exercise: exercisesTable })
    .from(loggedSetsTable)
    .leftJoin(exercisesTable, eq(loggedSetsTable.exerciseId, exercisesTable.id))
    .where(eq(loggedSetsTable.sessionId, params.data.sessionId));

  res.json(GetSessionResponse.parse({
    id: session.id,
    dayId: session.dayId,
    dayLabel: day?.label ?? "Unknown",
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    notes: session.notes ?? null,
    loggedSets: loggedSets.map(({ set, exercise }) => ({
      id: set.id,
      sessionId: set.sessionId,
      exerciseId: set.exerciseId,
      exerciseName: exercise?.name ?? "Unknown",
      setNumber: set.setNumber,
      actualWeightLbs: set.actualWeightLbs ?? null,
      actualReps: set.actualReps,
      completedAt: set.completedAt.toISOString(),
      isPersonalRecord: set.isPersonalRecord,
    })),
  }));
});

router.patch("/sessions/:sessionId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = UpdateSessionParams.safeParse({ sessionId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.completedAt) updates.completedAt = new Date(body.data.completedAt);
  if (body.data.notes) updates.notes = body.data.notes;

  const [session] = await db
    .update(workoutSessionsTable)
    .set(updates)
    .where(eq(workoutSessionsTable.id, params.data.sessionId))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const [day] = await db.select().from(workoutDaysTable).where(eq(workoutDaysTable.id, session.dayId));

  const sets = await db.select().from(loggedSetsTable).where(eq(loggedSetsTable.sessionId, session.id));

  res.json(UpdateSessionResponse.parse({
    id: session.id,
    dayId: session.dayId,
    dayLabel: day?.label ?? "Unknown",
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    notes: session.notes ?? null,
    totalSets: sets.length,
    completedSets: sets.length,
  }));
});

router.post("/sessions/:sessionId/sets", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const params = LogSetParams.safeParse({ sessionId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = LogSetBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // Check if this is a personal record
  let isPersonalRecord = false;
  if (body.data.actualWeightLbs) {
    const [existingMax] = await db
      .select()
      .from(exerciseMaxesTable)
      .where(eq(exerciseMaxesTable.exerciseId, body.data.exerciseId))
      .orderBy(desc(exerciseMaxesTable.maxWeightLbs))
      .limit(1);

    if (!existingMax || body.data.actualWeightLbs > existingMax.maxWeightLbs) {
      isPersonalRecord = true;
      // Upsert the max
      await db.insert(exerciseMaxesTable).values({
        exerciseId: body.data.exerciseId,
        maxWeightLbs: body.data.actualWeightLbs,
      });
    }
  }

  const [logged] = await db
    .insert(loggedSetsTable)
    .values({
      sessionId: params.data.sessionId,
      exerciseId: body.data.exerciseId,
      setNumber: body.data.setNumber,
      actualWeightLbs: body.data.actualWeightLbs ?? null,
      actualReps: body.data.actualReps,
      isPersonalRecord,
    })
    .returning();

  const [exercise] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, body.data.exerciseId));

  res.status(201).json(LogSetResponse.parse({
    id: logged.id,
    sessionId: logged.sessionId,
    exerciseId: logged.exerciseId,
    exerciseName: exercise?.name ?? "Unknown",
    setNumber: logged.setNumber,
    actualWeightLbs: logged.actualWeightLbs ?? null,
    actualReps: logged.actualReps,
    completedAt: logged.completedAt.toISOString(),
    isPersonalRecord: logged.isPersonalRecord,
  }));
});

export default router;
