import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, X, Trophy, Zap, Clock, Flame, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoggedSet {
  exerciseName: string;
  actualWeightLbs: number | null;
  actualReps: number;
  isPersonalRecord: boolean;
}

interface WorkoutSummaryModalProps {
  dayLabel: string;
  startedAt: string;
  completedAt?: string | null;
  loggedSets: LoggedSet[];
  onDone: () => void;
}

function formatDuration(startedAt: string, completedAt?: string | null): string {
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  const totalMins = Math.round(ms / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function WorkoutSummaryModal({ dayLabel, startedAt, completedAt, loggedSets, onDone }: WorkoutSummaryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute stats
  const totalSets = loggedSets.length;
  const totalVolume = loggedSets.reduce((acc, s) => acc + (s.actualWeightLbs ?? 0) * s.actualReps, 0);
  const prs = loggedSets.filter((s) => s.isPersonalRecord).length;
  const duration = formatDuration(startedAt, completedAt);

  // Group sets by exercise for the breakdown
  const byExercise: Record<string, { sets: number; volume: number; pr: boolean }> = {};
  for (const s of loggedSets) {
    if (!byExercise[s.exerciseName]) byExercise[s.exerciseName] = { sets: 0, volume: 0, pr: false };
    byExercise[s.exerciseName].sets++;
    byExercise[s.exerciseName].volume += (s.actualWeightLbs ?? 0) * s.actualReps;
    if (s.isPersonalRecord) byExercise[s.exerciseName].pr = true;
  }

  // Get the current primary color from CSS vars for the share card
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  // Convert "111 80% 50%" to hsl(111 80% 50%)
  const accentCss = `hsl(${primaryColor})`;

  const shareText = `💪 Just crushed ${dayLabel} on LiftIQ!\n⏱ ${duration} · 📦 ${totalSets} sets · 🔥 ${Math.round(totalVolume).toLocaleString()} lbs volume${prs > 0 ? ` · 🏆 ${prs} PR${prs > 1 ? "s" : ""}` : ""}\n\nTrack yours → liftiq.app`;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "liftiq-workout.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText, title: `${dayLabel} — LiftIQ` });
      } else if (navigator.share) {
        await navigator.share({ text: shareText, title: `${dayLabel} — LiftIQ` });
      } else {
        // Fallback: download the image
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "liftiq-workout.png";
        a.click();
      }
    } catch (err) {
      // User cancelled or share failed — silently ignore
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-4 animate-in slide-in-from-bottom-6 duration-400">

        {/* ── Shareable card (captured for image export) ── */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden"
          style={{ background: "#0a0a0a", border: `1px solid ${accentCss}30`, fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Header band */}
          <div style={{ background: `linear-gradient(135deg, ${accentCss}25 0%, transparent 60%)`, borderBottom: `1px solid ${accentCss}20`, padding: "20px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: accentCss, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", marginBottom: 4 }}>
                  LIFTIQ · {formatDate().toUpperCase()}
                </div>
                <div style={{ color: "#f9f9f9", fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                  {dayLabel}
                </div>
                <div style={{ color: "#888", fontSize: 12, fontWeight: 500, marginTop: 2 }}>
                  Workout complete
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accentCss}20`, border: `1px solid ${accentCss}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>🏆</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderBottom: `1px solid #1a1a1a` }}>
            {[
              { icon: "⏱", label: "TIME", value: duration },
              { icon: "📦", label: "SETS", value: totalSets },
              { icon: "🔥", label: "VOLUME", value: `${(totalVolume / 1000).toFixed(1)}k lbs` },
              { icon: "🏆", label: "PRs", value: prs },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "14px 10px",
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid #1a1a1a" : undefined,
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ color: accentCss, fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#555", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Exercise breakdown */}
          <div style={{ padding: "16px 24px" }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 10 }}>
              EXERCISES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(byExercise).map(([name, data]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {data.pr && (
                      <span style={{ background: accentCss, color: "#050505", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 4, letterSpacing: "0.08em" }}>
                        PR
                      </span>
                    )}
                    <span style={{ color: "#ccc", fontSize: 12, fontWeight: 500 }}>{name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: "#555", fontSize: 11, fontMono: true }}>
                      {data.sets} sets
                    </span>
                    {data.volume > 0 && (
                      <span style={{ color: "#444", fontSize: 11 }}>
                        {Math.round(data.volume).toLocaleString()} lbs
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 24px 16px", borderTop: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#333", fontSize: 10, letterSpacing: "0.1em" }}>liftiq.app</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[accentCss, "#555", "#333"].map((c, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {sharing ? (
              <span className="animate-pulse">PREPARING…</span>
            ) : (
              <><Share2 className="w-4 h-4" /> SHARE</>
            )}
          </button>

          <button
            onClick={handleCopy}
            title="Copy text to clipboard"
            className={cn(
              "px-4 py-4 rounded-2xl border transition-all",
              copied
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            title="Save as image"
            className="px-4 py-4 rounded-2xl border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-mono uppercase tracking-widest text-sm transition-all"
        >
          DONE
        </button>
      </div>
    </div>
  );
}
