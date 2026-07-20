import { Router, type IRouter } from "express";
import { timingSafeEqual, createHash } from "crypto";
import { issueToken, revokeToken } from "../lib/tokenStore";
import { extractValidBearerToken } from "../middlewares/requireSession";

const router: IRouter = Router();

/**
 * Hash the ADMIN_PASSWORD on every call so we never hold the plaintext
 * in a module-level variable that outlives the comparison.
 * Returns null if the secret is not configured.
 */
function getPasswordHash(): Buffer | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw).digest();
}

function checkPassword(input: string): boolean {
  const stored = getPasswordHash();
  if (!stored) return false;
  const inputHash = createHash("sha256").update(input).digest();
  // timingSafeEqual requires equal-length buffers; SHA-256 always gives 32 bytes
  return timingSafeEqual(inputHash, stored);
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
//
// Public endpoint — reachable before any session exists.
// Body: { password: string }
// Success (200): sets httpOnly session cookie (web) AND returns { ok, token }
//   (mobile callers persist the token in AsyncStorage and send it as a
//    Bearer header on subsequent requests).
// Failure: 400 / 401 / 503

router.post("/auth/login", (req, res): void => {
  const { password } = req.body ?? {};

  if (typeof password !== "string" || !password) {
    res.status(400).json({ error: "password is required" });
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({
      error:
        "Authentication is not configured. Set the ADMIN_PASSWORD environment secret and restart the server.",
    });
    return;
  }

  if (!checkPassword(password)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  // Mark the session as authenticated (web — cookie auto-sent by browser)
  (req.session as any).authenticated = true;

  // Issue an opaque token for mobile clients
  const token = issueToken();

  res.json({ ok: true, token });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
//
// Requires authentication (NOT in the public /auth/login or /auth/check
// exemption list). This prevents an unauthenticated caller from revoking
// other clients' tokens.
//
// - Destroys the caller's session cookie (web).
// - Revokes only the caller's own bearer token, if one was presented.
//   Other active sessions / tokens are left intact.

router.post("/auth/logout", (req, res): void => {
  // Revoke only the specific bearer token supplied by this caller (if any).
  // We do NOT call revokeAllTokens() — that would log out every mobile client.
  const callerToken = extractValidBearerToken(req);
  if (callerToken) {
    revokeToken(callerToken);
  }

  req.session.destroy(() => {
    res.status(204).end();
  });
});

// ─── GET /api/auth/check ──────────────────────────────────────────────────────
//
// Public endpoint — always returns 200 so the frontend can call it freely
// without triggering auth-error handling.
// Returns { authenticated: true } for a valid session cookie OR valid bearer token.

router.get("/auth/check", (req, res): void => {
  const sessionOk = (req.session as any)?.authenticated === true;
  const tokenOk = extractValidBearerToken(req) !== null;
  res.json({ authenticated: sessionOk || tokenOk });
});

export default router;
