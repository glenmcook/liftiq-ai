import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";

const router: IRouter = Router();

// POST /api/push/token
// Stores the Expo push token for the user profile so the server can send
// streak triggers, check-in reminders, and win-back notifications.
router.post("/push/token", async (req, res): Promise<void> => {
  const { token } = req.body as { token?: unknown };

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "token (string) is required" });
    return;
  }

  if (!token.startsWith("ExponentPushToken[")) {
    res.status(400).json({ error: "invalid Expo push token format" });
    return;
  }

  const [existing] = await db.select({ id: userProfilesTable.id }).from(userProfilesTable).limit(1);
  if (!existing) {
    res.status(404).json({ error: "no profile found" });
    return;
  }

  await db
    .update(userProfilesTable)
    .set({ pushToken: token, updatedAt: new Date() });

  res.json({ ok: true });
});

export default router;
