import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { SaveProfileBody, GetProfileResponse, SaveProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const [profile] = await db.select().from(userProfilesTable).limit(1);
  if (!profile) {
    res.status(404).json({ error: "No profile found" });
    return;
  }
  res.json(GetProfileResponse.parse({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  }));
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = SaveProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(userProfilesTable).limit(1);

  let profile;
  if (existing) {
    [profile] = await db
      .update(userProfilesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .returning();
  } else {
    [profile] = await db
      .insert(userProfilesTable)
      .values(parsed.data)
      .returning();
  }

  res.json(SaveProfileResponse.parse({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  }));
});

export default router;
