import { Router, type IRouter } from "express";
import {
  db,
  userProfilesTable,
  workoutPlansTable,
  workoutDaysTable,
  workoutExercisesTable,
  prescribedSetsTable,
  workoutSessionsTable,
  loggedSetsTable,
  exerciseMaxesTable,
  dexaScansTable,
  checkinsTable,
  recommendationsTable,
  dietRecommendationsTable,
  dietProfilesTable,
} from "@workspace/db";

const router: IRouter = Router();

// Wipes all user-entered data (profile, plans, workout history, DEXA scans,
// check-ins, cached AI recommendations, diet preferences) so the app can be
// walked through Calibrate again as if freshly installed. The exercise
// catalog itself is reference data, not user data, and is left alone —
// wiping it would break future plan generation, which looks up/creates
// exercises by name.
//
// Deletion order follows foreign-key dependencies (children before parents):
// logged sets -> sessions -> prescribed sets -> workout exercises -> days -> plans.
router.post("/account/reset", async (_req, res): Promise<void> => {
  await db.delete(loggedSetsTable);
  await db.delete(workoutSessionsTable);
  await db.delete(prescribedSetsTable);
  await db.delete(workoutExercisesTable);
  await db.delete(workoutDaysTable);
  await db.delete(workoutPlansTable);
  await db.delete(exerciseMaxesTable);
  await db.delete(dexaScansTable);
  await db.delete(checkinsTable);
  await db.delete(recommendationsTable);
  await db.delete(dietRecommendationsTable);
  await db.delete(dietProfilesTable);
  await db.delete(userProfilesTable);

  res.json({ ok: true });
});

export default router;
