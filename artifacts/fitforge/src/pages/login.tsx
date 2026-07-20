import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LiftIQMark } from "@/components/liftiq-logo";

const BASE = import.meta.env.BASE_URL;

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      // Invalidate all queries so they refetch now that we're authenticated
      await qc.invalidateQueries();
    } catch {
      setError("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <LiftIQMark className="w-16 h-16 text-primary" />
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-widest uppercase">
              <span className="text-foreground">LIFT</span>
              <span className="text-primary">IQ AI</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest mt-1">
              PERSONAL TRAINING SYSTEM
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block font-mono text-xs tracking-widest text-muted-foreground uppercase"
            >
              Access Code
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-primary text-primary-foreground font-black tracking-widest uppercase py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "AUTHENTICATING…" : "ENTER SYSTEM"}
          </button>
        </form>
      </div>
    </div>
  );
}
