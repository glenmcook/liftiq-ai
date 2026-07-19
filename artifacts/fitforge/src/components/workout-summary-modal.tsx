import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Copy, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Platform SVG icons ────────────────────────────────────────────────────────
function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(startedAt: string, completedAt?: string | null): string {
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  const totalMins = Math.round(ms / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
}

function formatDate(dateStr?: string | null): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function WorkoutSummaryModal({ dayLabel, startedAt, completedAt, loggedSets, onDone }: WorkoutSummaryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramHint, setInstagramHint] = useState(false);

  // Computed stats
  const totalSets = loggedSets.length;
  const maxWeight = Math.max(0, ...loggedSets.map((s) => s.actualWeightLbs ?? 0));
  const prs = loggedSets.filter((s) => s.isPersonalRecord).length;
  const duration = formatDuration(startedAt, completedAt);

  // Group by exercise
  const byExercise: Record<string, { sets: number; maxWeight: number; pr: boolean }> = {};
  for (const s of loggedSets) {
    if (!byExercise[s.exerciseName]) byExercise[s.exerciseName] = { sets: 0, maxWeight: 0, pr: false };
    byExercise[s.exerciseName].sets++;
    byExercise[s.exerciseName].maxWeight = Math.max(byExercise[s.exerciseName].maxWeight, s.actualWeightLbs ?? 0);
    if (s.isPersonalRecord) byExercise[s.exerciseName].pr = true;
  }

  // Read theme accent from CSS vars
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  const accentCss = `hsl(${primaryColor})`;

  const shareText = `💪 Just crushed ${dayLabel} on LiftIQ!\n⏱ ${duration} · 📦 ${totalSets} sets · 🏋️ ${maxWeight.toLocaleString()} lbs top set${prs > 0 ? ` · 🏆 ${prs} PR${prs > 1 ? "s" : ""}` : ""}\n\nTrack yours → liftiq.app`;

  // Generate image once and cache it
  const getImage = useCallback(async (): Promise<string | null> => {
    if (imageDataUrl) return imageDataUrl;
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      setImageDataUrl(url);
      return url;
    } catch {
      return null;
    } finally {
      setGenerating(false);
    }
  }, [imageDataUrl]);

  // ── Share handlers ──────────────────────────────────────────────────────────

  const handleX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=450");
  };

  const handleFacebook = () => {
    const appUrl = "https://liftiq.app";
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=450");
  };

  const handleInstagram = async () => {
    // Instagram has no web share URL — download the image so user can post it
    const dataUrl = await getImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "liftiq-workout.png";
    a.click();
    setInstagramHint(true);
    setTimeout(() => setInstagramHint(false), 4000);
  };

  const handleNativeShare = async () => {
    const dataUrl = await getImage();
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "liftiq-workout.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText, title: `${dayLabel} — LiftIQ` });
      } else if (navigator.share) {
        await navigator.share({ text: shareText, title: `${dayLabel} — LiftIQ` });
      }
    } catch { /* user cancelled */ }
  };

  const handleDownload = async () => {
    const dataUrl = await getImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "liftiq-workout.png";
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-md space-y-4 animate-in slide-in-from-bottom-6 duration-400 my-auto">

        {/* ── Shareable card (captured for image export) ── */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden"
          style={{ background: "#0a0a0a", border: `1px solid ${accentCss}30`, fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${accentCss}25 0%, transparent 60%)`, borderBottom: `1px solid ${accentCss}20`, padding: "20px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: accentCss, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", marginBottom: 4 }}>
                  LIFTIQ · {formatDate(completedAt).toUpperCase()}
                </div>
                <div style={{ color: "#f9f9f9", fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                  {dayLabel}
                </div>
                <div style={{ color: "#888", fontSize: 12, fontWeight: 500, marginTop: 2 }}>Workout complete</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accentCss}20`, border: `1px solid ${accentCss}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>🏆</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid #1a1a1a` }}>
            {[
              { icon: "⏱", label: "TIME", value: duration },
              { icon: "📦", label: "SETS", value: totalSets },
              { icon: "🏋️", label: "TOP SET", value: `${maxWeight.toLocaleString()} lbs` },
              { icon: "🏆", label: "PRs", value: prs },
            ].map((stat, i) => (
              <div key={stat.label} style={{ padding: "14px 10px", textAlign: "center", borderRight: i < 3 ? "1px solid #1a1a1a" : undefined }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ color: accentCss, fontSize: 16, fontWeight: 800 }}>{stat.value}</div>
                <div style={{ color: "#555", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Exercise breakdown */}
          <div style={{ padding: "16px 24px" }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 10 }}>EXERCISES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(byExercise).map(([name, data]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {data.pr && <span style={{ background: accentCss, color: "#050505", fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 4, letterSpacing: "0.08em" }}>PR</span>}
                    <span style={{ color: "#ccc", fontSize: 12, fontWeight: 500 }}>{name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ color: "#555", fontSize: 11 }}>{data.sets} sets</span>
                    {data.maxWeight > 0 && <span style={{ color: "#444", fontSize: 11 }}>{data.maxWeight.toLocaleString()} lbs</span>}
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

        {/* ── Social platform buttons ── */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Share to</p>

          <div className="grid grid-cols-3 gap-2">
            {/* X / Twitter */}
            <button
              onClick={handleX}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-border hover:border-[#1d9bf0]/50 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] text-muted-foreground transition-all"
            >
              <IconX />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">X / Twitter</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-border hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10 hover:text-[#1877f2] text-muted-foreground transition-all"
            >
              <IconFacebook />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Facebook</span>
            </button>

            {/* Instagram — download card */}
            <button
              onClick={handleInstagram}
              disabled={generating}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-border hover:border-[#e1306c]/50 hover:bg-[#e1306c]/10 hover:text-[#e1306c] text-muted-foreground transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <IconInstagram />}
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Instagram</span>
            </button>
          </div>

          {/* Instagram hint */}
          {instagramHint && (
            <p className="text-[11px] text-[#e1306c]/80 font-mono text-center animate-in fade-in duration-300">
              Image saved — open Instagram and create a post to share it 📸
            </p>
          )}
        </div>

        {/* ── Utility buttons ── */}
        <div className="flex gap-2">
          {/* Native share (mobile only — hidden on desktop) */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all text-sm font-mono uppercase tracking-widest disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              More
            </button>
          )}

          {/* Copy text */}
          <button
            onClick={handleCopy}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-mono uppercase tracking-widest",
              copied
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {/* Download image */}
          <button
            onClick={handleDownload}
            disabled={generating}
            title="Save card as image"
            className="px-4 py-3 rounded-xl border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
        </div>

        {/* Done */}
        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-mono uppercase tracking-widest text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
