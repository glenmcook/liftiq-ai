import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, dexaScansTable } from "@workspace/db";
import {
  CreateDexaScanBody,
  CreateDexaScanResponse,
  ListDexaScansResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dexa-scans", async (_req, res): Promise<void> => {
  const scans = await db
    .select()
    .from(dexaScansTable)
    .orderBy(desc(dexaScansTable.scanDate));

  const result = scans.map(s => ({
    id: s.id,
    scanDate: s.scanDate,
    bodyFatPercent: s.bodyFatPercent ?? null,
    leanMassLbs: s.leanMassLbs ?? null,
    fatMassLbs: s.fatMassLbs ?? null,
    boneDensity: s.boneDensity ?? null,
    totalWeightLbs: s.totalWeightLbs ?? null,
    visceralFatLevel: s.visceralFatLevel ?? null,
    notes: s.notes ?? null,
    createdAt: s.createdAt.toISOString(),
  }));

  res.json(ListDexaScansResponse.parse(result));
});

router.post("/dexa-scans", async (req, res): Promise<void> => {
  const body = CreateDexaScanBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [scan] = await db
    .insert(dexaScansTable)
    .values(body.data)
    .returning();

  res.status(201).json(CreateDexaScanResponse.parse({
    ...scan,
    bodyFatPercent: scan.bodyFatPercent ?? null,
    leanMassLbs: scan.leanMassLbs ?? null,
    fatMassLbs: scan.fatMassLbs ?? null,
    boneDensity: scan.boneDensity ?? null,
    totalWeightLbs: scan.totalWeightLbs ?? null,
    visceralFatLevel: scan.visceralFatLevel ?? null,
    notes: scan.notes ?? null,
    createdAt: scan.createdAt.toISOString(),
  }));
});

export default router;
