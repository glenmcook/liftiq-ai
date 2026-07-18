import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, exercisesTable, workoutExercisesTable } from "@workspace/db";
import {
  GetExerciseParams,
  GetExerciseResponse,
  GetAlternateExercisesParams,
  GetAlternateExercisesResponse,
  ListExercisesQueryParams,
  ListExercisesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/exercises", async (req, res): Promise<void> => {
  const query = ListExercisesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let exercises = await db.select().from(exercisesTable);

  if (query.data.muscleGroup) {
    exercises = exercises.filter(e => e.muscleGroup === query.data.muscleGroup);
  }
  if (query.data.category) {
    exercises = exercises.filter(e => e.category === query.data.category);
  }

  res.json(ListExercisesResponse.parse(exercises));
});

router.get("/exercises/:exerciseId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.exerciseId) ? req.params.exerciseId[0] : req.params.exerciseId;
  const params = GetExerciseParams.safeParse({ exerciseId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [exercise] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, params.data.exerciseId));

  if (!exercise) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }

  res.json(GetExerciseResponse.parse(exercise));
});

router.get("/exercises/:exerciseId/alternates", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.exerciseId) ? req.params.exerciseId[0] : req.params.exerciseId;
  const params = GetAlternateExercisesParams.safeParse({ exerciseId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [source] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, params.data.exerciseId));

  if (!source) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }

  const alternates = await db
    .select()
    .from(exercisesTable)
    .where(
      and(
        eq(exercisesTable.muscleGroup, source.muscleGroup),
      )
    );

  const filtered = alternates.filter(e => e.id !== source.id);
  res.json(GetAlternateExercisesResponse.parse(filtered));
});

export default router;
