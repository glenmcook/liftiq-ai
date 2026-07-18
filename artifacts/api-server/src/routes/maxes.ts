import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, exerciseMaxesTable, exercisesTable } from "@workspace/db";
import {
  UpsertExerciseMaxBody,
  UpsertExerciseMaxResponse,
  ListExerciseMaxesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/exercise-maxes", async (_req, res): Promise<void> => {
  const maxes = await db
    .select({ max: exerciseMaxesTable, exercise: exercisesTable })
    .from(exerciseMaxesTable)
    .leftJoin(exercisesTable, eq(exerciseMaxesTable.exerciseId, exercisesTable.id))
    .orderBy(desc(exerciseMaxesTable.achievedAt));

  // Return only the highest max per exercise
  const bestByExercise = new Map<number, typeof maxes[0]>();
  for (const row of maxes) {
    const existing = bestByExercise.get(row.max.exerciseId);
    if (!existing || row.max.maxWeightLbs > existing.max.maxWeightLbs) {
      bestByExercise.set(row.max.exerciseId, row);
    }
  }

  const result = Array.from(bestByExercise.values()).map(({ max, exercise }) => ({
    id: max.id,
    exerciseId: max.exerciseId,
    exerciseName: exercise?.name ?? "Unknown",
    maxWeightLbs: max.maxWeightLbs,
    achievedAt: max.achievedAt.toISOString(),
    notes: max.notes ?? null,
  }));

  res.json(ListExerciseMaxesResponse.parse(result));
});

router.post("/exercise-maxes", async (req, res): Promise<void> => {
  const body = UpsertExerciseMaxBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [max] = await db
    .insert(exerciseMaxesTable)
    .values({
      exerciseId: body.data.exerciseId,
      maxWeightLbs: body.data.maxWeightLbs,
      notes: body.data.notes ?? null,
    })
    .returning();

  const [exercise] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, body.data.exerciseId));

  res.json(UpsertExerciseMaxResponse.parse({
    id: max.id,
    exerciseId: max.exerciseId,
    exerciseName: exercise?.name ?? "Unknown",
    maxWeightLbs: max.maxWeightLbs,
    achievedAt: max.achievedAt.toISOString(),
    notes: max.notes ?? null,
  }));
});

export default router;
