import { type Request, type Response, type NextFunction } from "express";

/**
 * Simple in-memory rate limiter for AI-backed endpoints that trigger paid
 * OpenAI calls. Limits each client IP to MAX_REQUESTS calls per WINDOW_MS.
 *
 * Express must be configured with `app.set("trust proxy", 1)` (done in
 * app.ts) so that `req.ip` is correctly resolved from the X-Forwarded-For
 * header set by Replit's reverse proxy, instead of always seeing 127.0.0.1.
 *
 * Because this is backed by a plain Map the counter resets on server restart,
 * which is acceptable for a single-process personal-use server.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 20; // per window per IP

const _window = new Map<string, { count: number; resetAt: number }>();

// Periodically prune expired entries so the map doesn't grow unboundedly
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of _window) {
      if (now >= entry.resetAt) _window.delete(ip);
    }
  },
  WINDOW_MS
).unref();

export function aiRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // req.ip is correctly set when trust proxy is enabled in app.ts
  const ip = req.ip ?? "unknown";
  const now = Date.now();

  const entry = _window.get(ip);

  if (!entry || now >= entry.resetAt) {
    _window.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSecs));
    res.status(429).json({
      error: "Too many requests to AI endpoints. Please try again later.",
    });
    return;
  }

  entry.count += 1;
  next();
}
