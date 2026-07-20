import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, dexaScansTable } from "@workspace/db";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";
import { aiRateLimit } from "../middlewares/aiRateLimit";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  CreateDexaScanBody,
  CreateDexaScanResponse,
  ListDexaScansResponse,
} from "@workspace/api-zod";

const execFileAsync = promisify(execFile);

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

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

router.post("/dexa-scans/parse", upload.single("file"), aiRateLimit, async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  const { mimetype, buffer } = req.file;
  const isPdf = mimetype === "application/pdf";
  const isImage = mimetype.startsWith("image/");

  if (!isPdf && !isImage) {
    res.status(400).json({ error: "Unsupported file type. Upload a JPG, PNG, WebP, or PDF." });
    return;
  }

  const systemPrompt = `You are a DEXA scan report parser focused exclusively on body composition metrics.

PRIVACY RULES — STRICT:
- Do NOT extract, mention, or include any personally identifiable information (PII).
- Ignored fields (never include): patient name, date of birth, age, sex/gender, patient ID, medical record number, referring physician, facility name, address, insurance info, or any other identifying data.
- The notes field must contain ONLY clinical body composition observations — no names, no IDs, no demographics.

Extract ONLY the following body composition metrics and return a JSON object with these exact keys:
- scanDate: string (YYYY-MM-DD format, use today's date if not found — do NOT use the patient's date of birth)
- bodyFatPercent: number or null (total body fat percentage)
- leanMassLbs: number or null (total lean/muscle mass in pounds)
- fatMassLbs: number or null (total fat mass in pounds)
- boneDensity: number or null (bone mineral density in g/cm²)
- totalWeightLbs: number or null (total body weight in pounds)
- visceralFatLevel: number or null (visceral fat area or level, numeric value only)
- notes: string or null (ONLY: T-scores, Z-scores, regional lean/fat breakdown percentages, body score, ALMI, FFMI — no PII)

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    // Build image content for OpenAI Vision
    const imageContents: { type: "image_url"; image_url: { url: string; detail: "high" } }[] = [];

    if (isPdf) {
      // Convert PDF pages to PNG images using pdftoppm
      const tmpDir = await mkdtemp(join(tmpdir(), "dexa-"));
      const pdfPath = join(tmpDir, "input.pdf");
      await writeFile(pdfPath, buffer);
      try {
        await execFileAsync("pdftoppm", ["-png", "-r", "200", "-l", "4", pdfPath, join(tmpDir, "page")]);
        const files = (await readdir(tmpDir)).filter(f => f.endsWith(".png")).sort();
        for (const file of files.slice(0, 4)) {
          const imgBuf = await readFile(join(tmpDir, file));
          imageContents.push({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${imgBuf.toString("base64")}`, detail: "high" },
          });
        }
      } finally {
        await rm(tmpDir, { recursive: true, force: true });
      }
    } else {
      // Direct image upload
      imageContents.push({
        type: "image_url",
        image_url: { url: `data:${mimetype};base64,${buffer.toString("base64")}`, detail: "high" },
      });
    }

    if (imageContents.length === 0) {
      res.status(422).json({ error: "Could not extract any pages from the PDF." });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all body composition data from this DEXA scan report." },
            ...imageContents,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("DEXA parse error:", err);
    res.status(500).json({ error: "Failed to extract data from the file. Try a clearer image or enter manually." });
  }
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
