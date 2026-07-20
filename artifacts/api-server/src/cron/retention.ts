import cron from "node-cron";
import { db, userProfilesTable, workoutSessionsTable } from "@workspace/db";
import { desc, isNotNull } from "drizzle-orm";
import { sendExpoPush } from "../lib/expoPush";
import { logger } from "../lib/logger";

// ─── Inactivity check ─────────────────────────────────────────────────────────
// Runs every 6 hours. Sends a push notification at exactly 5 days and 30 days
// since the last completed session.

async function runInactivityCheck() {
  try {
    const [profile] = await db
      .select({ pushToken: userProfilesTable.pushToken })
      .from(userProfilesTable)
      .limit(1);

    if (!profile?.pushToken) return; // no token registered yet

    const [lastSession] = await db
      .select({ completedAt: workoutSessionsTable.completedAt })
      .from(workoutSessionsTable)
      .where(isNotNull(workoutSessionsTable.completedAt))
      .orderBy(desc(workoutSessionsTable.completedAt))
      .limit(1);

    if (!lastSession?.completedAt) return;

    const msSince = Date.now() - lastSession.completedAt.getTime();
    const daysSince = Math.floor(msSince / (1000 * 60 * 60 * 24));

    if (daysSince === 5) {
      await sendExpoPush({
        to: profile.pushToken,
        title: "Miss the iron? 💪",
        body: "You haven't logged a session in 5 days. Your plan is waiting.",
        data: { type: "streak_trigger" },
      });
      logger.info({ daysSince }, "Sent 5-day inactivity push");
    } else if (daysSince === 30) {
      await sendExpoPush({
        to: profile.pushToken,
        title: "Your plan is still here.",
        body: "It's been 30 days. Come back — your progress is waiting for you.",
        data: { type: "win_back" },
      });
      logger.info({ daysSince }, "Sent 30-day win-back push");
    }
  } catch (err) {
    logger.error({ err }, "Inactivity check error");
  }
}

// ─── Weekly check-in reminder ─────────────────────────────────────────────────
// Every Monday at 7 PM UTC.

async function runCheckinReminder() {
  try {
    const [profile] = await db
      .select({ pushToken: userProfilesTable.pushToken })
      .from(userProfilesTable)
      .limit(1);

    if (!profile?.pushToken) return;

    await sendExpoPush({
      to: profile.pushToken,
      title: "Weekly check-in ✅",
      body: "Log how your week went and get your AI coaching feedback.",
      data: { type: "checkin_reminder", screen: "/(tabs)/checkin" },
    });
    logger.info("Sent weekly check-in reminder push");
  } catch (err) {
    logger.error({ err }, "Check-in reminder error");
  }
}

// ─── Start all cron jobs ──────────────────────────────────────────────────────

export function startRetentionCron() {
  // Inactivity check — every 6 hours
  cron.schedule("0 */6 * * *", runInactivityCheck);

  // Weekly check-in reminder — every Monday at 19:00 UTC
  cron.schedule("0 19 * * 1", runCheckinReminder);

  logger.info("Retention cron jobs started (inactivity every 6h, check-in Mondays 19:00 UTC)");
}
