/**
 * In-memory store of long-lived mobile auth tokens.
 *
 * Tokens are issued at login and revoked on logout. Because this is a
 * single-user personal-use server, an in-memory Map is sufficient —
 * tokens survive as long as the process is running. Restart == re-login.
 *
 * Each token is a 32-byte cryptographically random hex string (64 chars).
 * It is opaque — it does not encode any user identity; the server just
 * checks whether the value exists in this Map.
 */
import { randomBytes } from "crypto";

interface TokenEntry {
  createdAt: number;
  /** Token lifetime in ms. Default: 30 days. */
  expiresAt: number;
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const _tokens = new Map<string, TokenEntry>();

/** Generate, store, and return a new opaque token. */
export function issueToken(): string {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  _tokens.set(token, { createdAt: now, expiresAt: now + TOKEN_TTL_MS });
  return token;
}

/** Returns true iff the token exists and has not expired. */
export function isValidToken(token: string): boolean {
  const entry = _tokens.get(token);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    _tokens.delete(token);
    return false;
  }
  return true;
}

/** Revoke a single token (called on logout for the caller's own token). */
export function revokeToken(token: string): void {
  _tokens.delete(token);
}

/** Revoke all issued tokens (e.g. on server reset / credential rotation). */
export function revokeAllTokens(): void {
  _tokens.clear();
}

// Periodically prune expired tokens so the Map doesn't grow unboundedly
setInterval(
  () => {
    const now = Date.now();
    for (const [token, entry] of _tokens) {
      if (now > entry.expiresAt) _tokens.delete(token);
    }
  },
  60 * 60 * 1000 // every hour
).unref();
