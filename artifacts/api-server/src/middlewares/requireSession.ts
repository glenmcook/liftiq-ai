import { type Request, type Response, type NextFunction } from "express";
import { isValidToken } from "../lib/tokenStore";

/**
 * Authentication guard applied to all /api/* routes.
 *
 * A request is considered authenticated when EITHER:
 *  a) its express-session carries `{ authenticated: true }` (web browser —
 *     cookie set by POST /api/auth/login, sent automatically for same-origin
 *     requests), OR
 *  b) it carries a valid `Authorization: Bearer <token>` header where the
 *     token was issued by POST /api/auth/login (mobile clients that store
 *     the token in device storage instead of cookies).
 *
 * Public paths that bypass this check (unauthenticated callers allowed):
 *  - /healthz        — public health endpoint
 *  - /auth/login     — must be reachable before a session exists
 *  - /auth/check     — must be reachable before a session exists
 *
 * Note: /auth/logout is NOT public — it requires authentication so that
 *   an unauthenticated caller cannot revoke other clients' tokens.
 *   The Stripe webhook is registered before this middleware in app.ts and
 *   is protected by Stripe signature verification.
 */

/**
 * Extract and validate the bearer token from the Authorization header.
 * Returns the token string if valid, or null.
 */
export function extractValidBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return isValidToken(token) ? token : null;
}

export function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const path = req.path;

  // Public paths — reachable before any session or token exists
  if (
    path === "/healthz" ||
    path === "/auth/login" ||
    path === "/auth/check"
  ) {
    next();
    return;
  }

  // a) Cookie session (web)
  if ((req.session as any)?.authenticated === true) {
    next();
    return;
  }

  // b) Bearer token (mobile)
  if (extractValidBearerToken(req) !== null) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}
