import { logger } from "./logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

export async function sendExpoPush(msg: PushMessage): Promise<void> {
  if (!msg.to?.startsWith("ExponentPushToken[")) {
    logger.warn({ to: msg.to }, "Skipping push — invalid token format");
    return;
  }

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({ sound: "default", ...msg }),
    });
    const json = (await res.json()) as { data?: { status: string; message?: string } };
    if (json.data?.status === "error") {
      logger.warn({ detail: json.data.message }, "Expo push delivery error");
    }
  } catch (err) {
    logger.error({ err }, "Expo push request failed");
  }
}
