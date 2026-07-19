import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, dexaScansTable } from "@workspace/db";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateDexaScanBody,
  CreateDexaScanResponse,
  ListDexaScansResponse,
} from "@workspace/api-zod";

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

router.post("/dexa-scans/parse", upload.single("file"), async (req, res): Promise<void> => {
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

  const systemPrompt = `You are a DEXA scan report parser. Extract body composition data from the provided document and return ONLY a JSON object with these exact keys:
- scanDate: string (YYYY-MM-DD format, use today's date if not found)
- bodyFatPercent: number or null (body fat percentage, e.g. 18.5)
- leanMassLbs: number or null (lean/muscle mass in pounds)
- fatMassLbs: number or null (fat mass in pounds)
- boneDensity: number or null (bone mineral density in g/cm²)
- totalWeightLbs: number or null (total body weight in pounds)
- visceralFatLevel: number or null (visceral fat area or level, numeric value only)
- notes: string or null (brief summary of notable findings, T-scores, Z-scores, or regional breakdown if present)

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    let extractedText = "";

    if (isPdf) {
      // Extract text from PDF using pdf-parse
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;

      const response = await openai.chat.completions.create({
        model: "gpt-5.6-luna",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the text extracted from a DEXA scan PDF report:\n\n${extractedText.slice(0, 8000)}` },
        ],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
      res.json(parsed);
    } else {
      // Image: use Vision API
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimetype};base64,${base64}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.6-luna",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all body composition data from this DEXA scan report image." },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
      res.json(parsed);
    }
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
