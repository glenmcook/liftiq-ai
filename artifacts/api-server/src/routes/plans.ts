import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { aiRateLimit } from "../middlewares/aiRateLimit";
import {
  db,
  workoutPlansTable,
  workoutDaysTable,
  workoutExercisesTable,
  prescribedSetsTable,
  exercisesTable,
  userProfilesTable,
} from "@workspace/db";
import {
  GetPlanParams,
  GetPlanResponse,
  GeneratePlanResponse,
  ListPlansResponse,
  GetActivePlanResponse,
  GetWorkoutDayParams,
  GetWorkoutDayResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Helper to build full plan detail object
async function buildPlanDetail(planId: number) {
  const [plan] = await db.select().from(workoutPlansTable).where(eq(workoutPlansTable.id, planId));
  if (!plan) return null;

  const days = await db
    .select()
    .from(workoutDaysTable)
    .where(eq(workoutDaysTable.planId, planId))
    .orderBy(workoutDaysTable.dayNumber);

  return {
    ...plan,
    aiNotes: plan.aiNotes ?? null,
    createdAt: plan.createdAt.toISOString(),
    days: days.map(d => ({
      id: d.id,
      planId: d.planId,
      dayNumber: d.dayNumber,
      label: d.label,
      focus: d.focus,
      restSeconds: d.restSeconds,
      notes: d.notes ?? null,
    })),
  };
}

router.get("/plans/active", async (_req, res): Promise<void> => {
  const [plan] = await db
    .select()
    .from(workoutPlansTable)
    .where(eq(workoutPlansTable.isActive, true))
    .orderBy(desc(workoutPlansTable.createdAt))
    .limit(1);

  if (!plan) {
    res.status(404).json({ error: "No active plan found" });
    return;
  }

  const detail = await buildPlanDetail(plan.id);
  if (!detail) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json(GetActivePlanResponse.parse(detail));
});

router.get("/plans", async (_req, res): Promise<void> => {
  const plans = await db
    .select()
    .from(workoutPlansTable)
    .orderBy(desc(workoutPlansTable.createdAt));

  res.json(
    ListPlansResponse.parse(
      plans.map(p => ({
        ...p,
        aiNotes: p.aiNotes ?? null,
        createdAt: p.createdAt.toISOString(),
      }))
    )
  );
});

router.get("/plans/:planId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.planId) ? req.params.planId[0] : req.params.planId;
  const params = GetPlanParams.safeParse({ planId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const detail = await buildPlanDetail(params.data.planId);
  if (!detail) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  res.json(GetPlanResponse.parse(detail));
});

router.post("/plans/generate", aiRateLimit, async (req, res): Promise<void> => {
  const [profile] = await db.select().from(userProfilesTable).limit(1);

  let planSpec: {
    name: string;
    description: string;
    planType: string;
    aiNotes: string;
    days: Array<{
      dayNumber: number;
      label: string;
      focus: string;
      restSeconds: number;
      notes: string;
      exercises: Array<{
        groupName: string;
        pickOne: boolean;
        sortOrder: number;
        exerciseName: string;
        sets: Array<{ setNumber: number; targetWeightLbs: number | null; targetRepsMin: number; targetRepsMax: number; restSeconds: number }>;
      }>;
    }>;
  };

  const profileContext = profile
    ? `Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weightLbs ?? "unknown"}lbs, Goal: ${profile.fitnessGoal}, Level: ${profile.experienceLevel}, Days/week: ${profile.daysPerWeek}, Current activities: ${profile.currentActivities ?? "none"}.`
    : "No profile data available. Create a general intermediate PPL program.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You are an expert personal trainer. Generate a structured workout plan as a JSON object. Respond ONLY with valid JSON, no markdown, no explanation.`,
        },
        {
          role: "user",
          content: `Generate a personalized Push/Pull/Legs workout plan for this specific athlete:

ATHLETE PROFILE:
${profileContext}

IMPORTANT — read the athlete profile carefully before choosing exercises:
- Select exercises that complement their current activities (e.g. if they swim, emphasize pulling strength and shoulder mobility; if they run, consider hip stability and single-leg work)
- Match exercise complexity to their experience level (beginners get simpler movement patterns; advanced athletes get more technical variations)
- Adjust volume and intensity to their goal (fat loss = higher reps, shorter rest; muscle gain = heavier, lower reps; athletic performance = mix of power and hypertrophy)
- Do NOT default to a generic template — the exercise selection, rep schemes, and weights must reflect THIS person's profile

The plan should run ${profile?.daysPerWeek ?? 6} days. Use a PPL split. Label days simply as Pull/Push/Legs unless you have a specific training reason to differentiate intensity (e.g. the athlete trains 6 days and needs a deload day, or their goal explicitly benefits from undulating periodization). Do NOT add Heavy/Light/Volume labels just to fill slots — only use them if they genuinely serve this athlete's program.

Return ONLY this exact JSON structure, no markdown, no explanation:
{
  "name": "string — a name reflecting this athlete's goal, not a generic template name",
  "description": "string — 1-2 sentences describing why this specific plan fits this athlete",
  "planType": "ppl",
  "aiNotes": "string — 2-3 sentences of coaching notes specific to this athlete's situation, mentioning their current activities and how the plan accounts for them",
  "days": [
    {
      "dayNumber": 1,
      "label": "Pull (Heavy)",
      "focus": "pull",
      "restSeconds": 120,
      "notes": "optional note about this specific day",
      "exercises": [
        {
          "groupName": "descriptive group name",
          "pickOne": true,
          "sortOrder": 0,
          "exerciseName": "Exercise Name",
          "sets": [
            { "setNumber": 1, "targetWeightLbs": 110, "targetRepsMin": 8, "targetRepsMax": 8, "restSeconds": 90 }
          ]
        }
      ]
    }
  ]
}

Rules:
- 4-6 exercise groups per day
- When pickOne is true, include exactly 2 exercise options sharing the same groupName (give the athlete a choice)
- Weight targets must be realistic for the athlete's stated experience level and body weight
- For beginners: 3 sets of 10-15 reps, moderate weight. For intermediate: 3-4 sets of 6-12 reps, progressive. For advanced: 4-5 sets of 4-8 reps, heavy
- Rest times: compound movements 90-180s, isolation 45-90s
- Choose exercises that serve THIS athlete — vary from the standard template if their profile warrants it`,
        },
      ],
    });

    const rawJson = completion.choices[0]?.message?.content ?? "{}";
    planSpec = JSON.parse(rawJson);
  } catch (err) {
    req.log.error({ err }, "AI plan generation failed, using default plan");
    planSpec = getDefaultPlan(profile?.fitnessGoal ?? "build_muscle", profile?.experienceLevel ?? "intermediate");
  }

  // Deactivate all current plans
  await db.update(workoutPlansTable).set({ isActive: false });

  // Create the new plan
  const [plan] = await db
    .insert(workoutPlansTable)
    .values({
      name: planSpec.name,
      description: planSpec.description,
      planType: planSpec.planType,
      isActive: true,
      aiNotes: planSpec.aiNotes,
    })
    .returning();

  // Get or create exercises and build the plan structure
  for (const daySpec of planSpec.days) {
    const [day] = await db
      .insert(workoutDaysTable)
      .values({
        planId: plan.id,
        dayNumber: daySpec.dayNumber,
        label: daySpec.label,
        focus: daySpec.focus,
        restSeconds: daySpec.restSeconds,
        notes: daySpec.notes ?? null,
      })
      .returning();

    for (const exSpec of daySpec.exercises) {
      // Find or create exercise
      let [exercise] = await db
        .select()
        .from(exercisesTable)
        .where(eq(exercisesTable.name, exSpec.exerciseName));

      if (!exercise) {
        const muscleGroup = getMuscleGroup(daySpec.focus, exSpec.exerciseName);
        const category = getCategory(exSpec.exerciseName);
        [exercise] = await db
          .insert(exercisesTable)
          .values({
            name: exSpec.exerciseName,
            muscleGroup,
            category,
            equipment: getEquipment(exSpec.exerciseName),
            videoUrl: getVideoUrl(exSpec.exerciseName),
            instructions: getInstructions(exSpec.exerciseName),
          })
          .returning();
      }

      const [we] = await db
        .insert(workoutExercisesTable)
        .values({
          dayId: day.id,
          exerciseId: exercise.id,
          groupName: exSpec.groupName,
          pickOne: exSpec.pickOne,
          sortOrder: exSpec.sortOrder,
        })
        .returning();

      for (const setSpec of exSpec.sets) {
        await db.insert(prescribedSetsTable).values({
          workoutExerciseId: we.id,
          setNumber: setSpec.setNumber,
          targetWeightLbs: setSpec.targetWeightLbs,
          targetRepsMin: setSpec.targetRepsMin,
          targetRepsMax: setSpec.targetRepsMax,
          restSeconds: setSpec.restSeconds,
        });
      }
    }
  }

  const detail = await buildPlanDetail(plan.id);
  res.status(201).json(GeneratePlanResponse.parse(detail));
});

// Workout day detail route
router.get("/days/:dayId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.dayId) ? req.params.dayId[0] : req.params.dayId;
  const params = GetWorkoutDayParams.safeParse({ dayId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [day] = await db
    .select()
    .from(workoutDaysTable)
    .where(eq(workoutDaysTable.id, params.data.dayId));

  if (!day) {
    res.status(404).json({ error: "Workout day not found" });
    return;
  }

  const workoutExercises = await db
    .select({ we: workoutExercisesTable, exercise: exercisesTable })
    .from(workoutExercisesTable)
    .leftJoin(exercisesTable, eq(workoutExercisesTable.exerciseId, exercisesTable.id))
    .where(eq(workoutExercisesTable.dayId, params.data.dayId))
    .orderBy(workoutExercisesTable.sortOrder);

  const allSets = await db.select().from(prescribedSetsTable);
  const setsByWE: Record<number, typeof allSets> = {};
  for (const s of allSets) {
    if (!setsByWE[s.workoutExerciseId]) setsByWE[s.workoutExerciseId] = [];
    setsByWE[s.workoutExerciseId].push(s);
  }

  // Group by groupName
  const groupMap = new Map<string, { groupName: string; pickOne: boolean; exercises: unknown[] }>();
  for (const { we, exercise } of workoutExercises) {
    if (!exercise) continue;
    if (!groupMap.has(we.groupName)) {
      groupMap.set(we.groupName, { groupName: we.groupName, pickOne: we.pickOne, exercises: [] });
    }
    const group = groupMap.get(we.groupName)!;
    const weSets = (setsByWE[we.id] ?? []).sort((a, b) => a.setNumber - b.setNumber);
    group.exercises.push({
      id: we.id,
      dayId: we.dayId,
      exerciseId: we.exerciseId,
      groupName: we.groupName,
      pickOne: we.pickOne,
      sortOrder: we.sortOrder,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description ?? null,
        muscleGroup: exercise.muscleGroup,
        category: exercise.category,
        equipment: exercise.equipment ?? null,
        videoUrl: exercise.videoUrl ?? null,
        instructions: exercise.instructions ?? null,
      },
      prescribedSets: weSets.map(s => ({
        id: s.id,
        workoutExerciseId: s.workoutExerciseId,
        setNumber: s.setNumber,
        targetWeightLbs: s.targetWeightLbs ?? null,
        targetRepsMin: s.targetRepsMin,
        targetRepsMax: s.targetRepsMax,
        restSeconds: s.restSeconds,
        notes: s.notes ?? null,
      })),
    });
  }

  const exerciseGroups = Array.from(groupMap.values());

  res.json(
    GetWorkoutDayResponse.parse({
      id: day.id,
      planId: day.planId,
      dayNumber: day.dayNumber,
      label: day.label,
      focus: day.focus,
      restSeconds: day.restSeconds,
      notes: day.notes ?? null,
      exerciseGroups,
    })
  );
});

// Helper functions
function getMuscleGroup(focus: string, exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes("curl") || name.includes("bicep")) return "biceps";
  if (name.includes("tricep") || name.includes("pushdown") || name.includes("skull")) return "triceps";
  if (name.includes("lat") || name.includes("pull") || name.includes("row") || name.includes("pulldown")) return "back";
  if (name.includes("bench") || name.includes("fly") || name.includes("chest") || name.includes("press") && focus === "push") return "chest";
  if (name.includes("shoulder") || name.includes("lateral") || name.includes("delt") || name.includes("face pull")) return "shoulders";
  if (name.includes("squat") || name.includes("leg") || name.includes("lunge") || name.includes("calf") || name.includes("deadlift")) return "legs";
  if (name.includes("crunch") || name.includes("plank") || name.includes("ab") || name.includes("knee raise")) return "core";
  const focusMap: Record<string, string> = { pull: "back", push: "chest", legs: "legs", full_body: "back" };
  return focusMap[focus] ?? "back";
}

function getCategory(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes("pullup") || name.includes("push-up") || name.includes("dip") || name.includes("knee raise")) return "bodyweight";
  if (name.includes("squat") || name.includes("deadlift") || name.includes("bench") || name.includes("row") || name.includes("press")) return "compound";
  return "isolation";
}

function getEquipment(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes("barbell") || name.includes("bench")) return "barbell";
  if (name.includes("dumbbell") || name.includes("db ")) return "dumbbell";
  if (name.includes("cable") || name.includes("pulldown") || name.includes("face pull") || name.includes("pushdown")) return "cable machine";
  if (name.includes("pullup") || name.includes("pull-up") || name.includes("knee raise")) return "pull-up bar";
  if (name.includes("leg press") || name.includes("leg extension") || name.includes("leg curl")) return "machine";
  return "dumbbell";
}

function getVideoUrl(exerciseName: string): string | null {
  const videoMap: Record<string, string> = {
    "Lat Pulldown": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    "Assisted Pull-Up": "https://www.youtube.com/watch?v=I_ptQDRBDVQ",
    "Seated Cable Row": "https://www.youtube.com/watch?v=GZbfZ033f74",
    "Barbell Row": "https://www.youtube.com/watch?v=9efgcAjQe7E",
    "Dumbbell Row": "https://www.youtube.com/watch?v=roCP6wCXPqo",
    "Face Pull": "https://www.youtube.com/watch?v=rep-qVOkqgk",
    "DB Curl": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    "Hanging Knee Raises": "https://www.youtube.com/watch?v=Pr1ieGZ5atk",
    "Bench Press": "https://www.youtube.com/watch?v=SCVCLChPQFY",
    "Incline DB Press": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    "Overhead Press": "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    "Lateral Raises": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    "Tricep Pushdown": "https://www.youtube.com/watch?v=vB5OHsJ3EME",
    "Squat": "https://www.youtube.com/watch?v=ultWZbUMPL8",
    "Leg Press": "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
    "Romanian Deadlift": "https://www.youtube.com/watch?v=hCDzSR6bW10",
    "Leg Extension": "https://www.youtube.com/watch?v=YyvSfVjQeL0",
    "Leg Curl": "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
    "Calf Raises": "https://www.youtube.com/watch?v=-M4-G8p1fCI",
  };
  return videoMap[exerciseName] ?? null;
}

function getInstructions(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  if (name.includes("pulldown")) return "Grip the bar slightly wider than shoulder-width. Pull down to upper chest, keeping elbows pointed down. Squeeze lats at bottom. Slowly return.";
  if (name.includes("row") && name.includes("cable")) return "Sit upright, grip the handle. Pull to lower chest, squeezing shoulder blades together. Hold briefly. Slowly return.";
  if (name.includes("row") && name.includes("dumbbell")) return "Brace on bench with opposite knee and hand. Row dumbbell to hip, elbow tracking back. Squeeze at top. Lower with control.";
  if (name.includes("face pull")) return "Set cable at upper chest height. Pull to face, rotating hands outward. Squeeze rear delts and external rotators. Slow return.";
  if (name.includes("curl")) return "Stand with dumbbells at sides. Curl toward shoulder, supinating wrist at top. Squeeze bicep. Lower with control.";
  if (name.includes("bench press")) return "Lie back, grip bar just outside shoulder width. Lower to lower chest under control. Drive up powerfully, keeping wrists straight.";
  if (name.includes("squat")) return "Stand with bar across upper traps. Brace core, sit back and down. Keep chest tall and knees tracking toes. Drive through heels to stand.";
  if (name.includes("deadlift")) return "Hinge at hips, soft knee bend. Grip bar, back flat. Drive hips forward to stand. Squeeze glutes at top. Lower with control.";
  return "Perform with controlled form, focusing on the target muscle. Breathe out on exertion.";
}

function getDefaultPlan(goal: string, level: string) {
  const weightMultiplier = level === "beginner" ? 0.6 : level === "advanced" ? 1.2 : 1.0;
  const w = (base: number) => Math.round(base * weightMultiplier / 5) * 5;

  return {
    name: `6-Day PPL ${level.charAt(0).toUpperCase() + level.slice(1)} Program`,
    description: `A Push/Pull/Legs split optimized for ${goal.replace("_", " ")}. Run twice weekly for maximum frequency and volume.`,
    planType: "ppl",
    aiNotes: `Based on your ${level} level and goal to ${goal.replace("_", " ")}, this 6-day PPL program maximizes muscle protein synthesis through high frequency training. Focus on progressive overload — increase weight when you hit the top of the rep range for all sets.`,
    days: [
      {
        dayNumber: 1,
        label: "Pull (Heavy)",
        focus: "pull",
        restSeconds: 120,
        notes: "Focus on heavy compound movements first",
        exercises: [
          { groupName: "Lat Movement", pickOne: true, sortOrder: 0, exerciseName: "Lat Pulldown", sets: [{ setNumber: 1, targetWeightLbs: w(110), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(120), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(130), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 120 }] },
          { groupName: "Lat Movement", pickOne: true, sortOrder: 1, exerciseName: "Assisted Pull-Up", sets: [{ setNumber: 1, targetWeightLbs: w(50), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(40), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(30), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 120 }] },
          { groupName: "Row Movement", pickOne: true, sortOrder: 2, exerciseName: "Seated Cable Row", sets: [{ setNumber: 1, targetWeightLbs: w(145), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(160), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(172), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 120 }] },
          { groupName: "Unilateral Row", pickOne: false, sortOrder: 3, exerciseName: "Dumbbell Row", sets: [{ setNumber: 1, targetWeightLbs: w(45), targetRepsMin: 10, targetRepsMax: 10, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(50), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(55), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 90 }] },
          { groupName: "Rear Delt", pickOne: false, sortOrder: 4, exerciseName: "Face Pull", sets: [{ setNumber: 1, targetWeightLbs: w(50), targetRepsMin: 15, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(55), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(60), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
          { groupName: "Biceps", pickOne: false, sortOrder: 5, exerciseName: "DB Curl", sets: [{ setNumber: 1, targetWeightLbs: w(30), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(35), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(35), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 60 }] },
          { groupName: "Core", pickOne: false, sortOrder: 6, exerciseName: "Hanging Knee Raises", sets: [{ setNumber: 1, targetWeightLbs: null, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: null, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: null, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }] },
        ],
      },
      {
        dayNumber: 2,
        label: "Push (Heavy)",
        focus: "push",
        restSeconds: 120,
        notes: "Prioritize chest and shoulder strength",
        exercises: [
          { groupName: "Chest Press", pickOne: false, sortOrder: 0, exerciseName: "Bench Press", sets: [{ setNumber: 1, targetWeightLbs: w(135), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 120 }, { setNumber: 2, targetWeightLbs: w(155), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 120 }, { setNumber: 3, targetWeightLbs: w(175), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 150 }] },
          { groupName: "Incline Press", pickOne: false, sortOrder: 1, exerciseName: "Incline DB Press", sets: [{ setNumber: 1, targetWeightLbs: w(50), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(55), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(60), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 90 }] },
          { groupName: "Shoulder Press", pickOne: false, sortOrder: 2, exerciseName: "Overhead Press", sets: [{ setNumber: 1, targetWeightLbs: w(95), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(105), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(115), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 120 }] },
          { groupName: "Lateral Deltoid", pickOne: false, sortOrder: 3, exerciseName: "Lateral Raises", sets: [{ setNumber: 1, targetWeightLbs: w(15), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(20), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(20), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
          { groupName: "Triceps", pickOne: false, sortOrder: 4, exerciseName: "Tricep Pushdown", sets: [{ setNumber: 1, targetWeightLbs: w(50), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(60), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(65), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 60 }] },
        ],
      },
      {
        dayNumber: 3,
        label: "Legs (Heavy)",
        focus: "legs",
        restSeconds: 150,
        notes: "Heaviest leg day — prioritize squat depth and form",
        exercises: [
          { groupName: "Quad Dominant", pickOne: true, sortOrder: 0, exerciseName: "Squat", sets: [{ setNumber: 1, targetWeightLbs: w(135), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 150 }, { setNumber: 2, targetWeightLbs: w(155), targetRepsMin: 8, targetRepsMax: 8, restSeconds: 150 }, { setNumber: 3, targetWeightLbs: w(175), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 180 }] },
          { groupName: "Quad Dominant", pickOne: true, sortOrder: 1, exerciseName: "Leg Press", sets: [{ setNumber: 1, targetWeightLbs: w(270), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 120 }, { setNumber: 2, targetWeightLbs: w(300), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 120 }, { setNumber: 3, targetWeightLbs: w(320), targetRepsMin: 6, targetRepsMax: 8, restSeconds: 150 }] },
          { groupName: "Hamstring", pickOne: false, sortOrder: 2, exerciseName: "Romanian Deadlift", sets: [{ setNumber: 1, targetWeightLbs: w(115), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(135), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(145), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 90 }] },
          { groupName: "Quad Isolation", pickOne: false, sortOrder: 3, exerciseName: "Leg Extension", sets: [{ setNumber: 1, targetWeightLbs: w(100), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(110), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(115), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
          { groupName: "Hamstring Isolation", pickOne: false, sortOrder: 4, exerciseName: "Leg Curl", sets: [{ setNumber: 1, targetWeightLbs: w(80), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(90), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(95), targetRepsMin: 8, targetRepsMax: 10, restSeconds: 60 }] },
          { groupName: "Calves", pickOne: false, sortOrder: 5, exerciseName: "Calf Raises", sets: [{ setNumber: 1, targetWeightLbs: w(135), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 45 }, { setNumber: 2, targetWeightLbs: w(135), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 45 }, { setNumber: 3, targetWeightLbs: w(135), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 45 }] },
        ],
      },
      {
        dayNumber: 4,
        label: "Pull (Light)",
        focus: "pull",
        restSeconds: 90,
        notes: "Lighter day — focus on form and volume",
        exercises: [
          { groupName: "Lat Movement", pickOne: false, sortOrder: 0, exerciseName: "Lat Pulldown", sets: [{ setNumber: 1, targetWeightLbs: w(95), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 2, targetWeightLbs: w(105), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }, { setNumber: 3, targetWeightLbs: w(110), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }] },
          { groupName: "Row Movement", pickOne: false, sortOrder: 1, exerciseName: "Seated Cable Row", sets: [{ setNumber: 1, targetWeightLbs: w(120), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 2, targetWeightLbs: w(130), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }, { setNumber: 3, targetWeightLbs: w(140), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }] },
          { groupName: "Rear Delt", pickOne: false, sortOrder: 2, exerciseName: "Face Pull", sets: [{ setNumber: 1, targetWeightLbs: w(45), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(50), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(50), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }] },
          { groupName: "Biceps", pickOne: false, sortOrder: 3, exerciseName: "DB Curl", sets: [{ setNumber: 1, targetWeightLbs: w(25), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(30), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(30), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
          { groupName: "Core", pickOne: false, sortOrder: 4, exerciseName: "Hanging Knee Raises", sets: [{ setNumber: 1, targetWeightLbs: null, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 45 }, { setNumber: 2, targetWeightLbs: null, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 45 }, { setNumber: 3, targetWeightLbs: null, targetRepsMin: 15, targetRepsMax: 20, restSeconds: 45 }] },
        ],
      },
      {
        dayNumber: 5,
        label: "Push (Light)",
        focus: "push",
        restSeconds: 90,
        notes: "Volume day — slightly lower weight, higher reps",
        exercises: [
          { groupName: "Chest Press", pickOne: false, sortOrder: 0, exerciseName: "Incline DB Press", sets: [{ setNumber: 1, targetWeightLbs: w(45), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 2, targetWeightLbs: w(50), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 3, targetWeightLbs: w(55), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }] },
          { groupName: "Shoulder Press", pickOne: false, sortOrder: 1, exerciseName: "Overhead Press", sets: [{ setNumber: 1, targetWeightLbs: w(75), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 2, targetWeightLbs: w(85), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }, { setNumber: 3, targetWeightLbs: w(90), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }] },
          { groupName: "Lateral Deltoid", pickOne: false, sortOrder: 2, exerciseName: "Lateral Raises", sets: [{ setNumber: 1, targetWeightLbs: w(12), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(15), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(15), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }] },
          { groupName: "Triceps", pickOne: false, sortOrder: 3, exerciseName: "Tricep Pushdown", sets: [{ setNumber: 1, targetWeightLbs: w(40), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(45), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(50), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
        ],
      },
      {
        dayNumber: 6,
        label: "Legs (Light)",
        focus: "legs",
        restSeconds: 90,
        notes: "Accessory and isolation focus",
        exercises: [
          { groupName: "Quad Dominant", pickOne: false, sortOrder: 0, exerciseName: "Leg Press", sets: [{ setNumber: 1, targetWeightLbs: w(220), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 90 }, { setNumber: 2, targetWeightLbs: w(250), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 90 }, { setNumber: 3, targetWeightLbs: w(270), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90 }] },
          { groupName: "Hamstring", pickOne: false, sortOrder: 1, exerciseName: "Romanian Deadlift", sets: [{ setNumber: 1, targetWeightLbs: w(95), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 2, targetWeightLbs: w(110), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 75 }, { setNumber: 3, targetWeightLbs: w(115), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 75 }] },
          { groupName: "Quad Isolation", pickOne: false, sortOrder: 2, exerciseName: "Leg Extension", sets: [{ setNumber: 1, targetWeightLbs: w(80), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(90), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(95), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }] },
          { groupName: "Hamstring Isolation", pickOne: false, sortOrder: 3, exerciseName: "Leg Curl", sets: [{ setNumber: 1, targetWeightLbs: w(65), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 60 }, { setNumber: 2, targetWeightLbs: w(75), targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60 }, { setNumber: 3, targetWeightLbs: w(80), targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60 }] },
          { groupName: "Calves", pickOne: false, sortOrder: 4, exerciseName: "Calf Raises", sets: [{ setNumber: 1, targetWeightLbs: w(115), targetRepsMin: 20, targetRepsMax: 25, restSeconds: 45 }, { setNumber: 2, targetWeightLbs: w(115), targetRepsMin: 20, targetRepsMax: 25, restSeconds: 45 }, { setNumber: 3, targetWeightLbs: w(115), targetRepsMin: 15, targetRepsMax: 20, restSeconds: 45 }] },
        ],
      },
    ],
  };
}

export default router;
