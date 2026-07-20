import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

// ── Congratulations message pool ─────────────────────────────────────────────
const MESSAGES = [
  { headline: "BEAST MODE: UNLOCKED", sub: "You showed up. You did the work. That's everything." },
  { headline: "PROTOCOL EXECUTED", sub: "Every rep is a vote for the person you're becoming." },
  { headline: "ANOTHER DAY, ANOTHER LEVEL", sub: "The weights didn't move themselves. You did that." },
  { headline: "DOMINANCE. LOGGED.", sub: "Your future self is already thanking you." },
  { headline: "MISSION ACCOMPLISHED", sub: "Most people quit before they start. You finished." },
  { headline: "YOU EARNED THIS.", sub: "Rest hard. Come back harder." },
  { headline: "IRON WILL CONFIRMED", sub: "Champions are made in sessions like this one." },
  { headline: "LIMITS? WHAT LIMITS?", sub: "You just pushed past what yesterday's version of you thought was possible." },
  { headline: "BUILT, NOT BORN", sub: "Greatness isn't gifted — it's ground out. Respect." },
  { headline: "PROGRESS BANKED.", sub: "The compound interest of consistent effort is insane. Keep going." },
  { headline: "NO DAYS OFF MENTALITY", sub: "When it's done it's done. And today — it's done right." },
  { headline: "STRENGTH ACQUIRED", sub: "You came in, you focused, you delivered. That's the formula." },
];

// Pick a random message, seeded to the current date so it changes daily but
// stays consistent within a single workout session.
function getDailyMessage() {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // changes each day
  return MESSAGES[seed % MESSAGES.length];
}

// ── Fireworks launcher ────────────────────────────────────────────────────────
function launchFireworks(primaryHex: string) {
  const duration = 3200;
  const end = Date.now() + duration;

  // Colours: theme accent + gold + white
  const colors = [primaryHex, "#FFD700", "#ffffff", "#ff4e50", "#fc913a"];

  // Initial centre burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { x: 0.5, y: 0.55 },
    colors,
    startVelocity: 45,
    gravity: 0.9,
    scalar: 1.1,
    shapes: ["star", "circle"],
  });

  // Side cannons
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors, startVelocity: 50 });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors, startVelocity: 50 });
  }, 300);

  // Random rockets
  const interval = setInterval(() => {
    if (Date.now() > end) { clearInterval(interval); return; }
    confetti({
      particleCount: 35,
      angle: 90 + (Math.random() - 0.5) * 60,
      spread: 45,
      origin: { x: Math.random(), y: 0.9 },
      colors,
      startVelocity: 55 + Math.random() * 20,
      gravity: 0.85,
      scalar: 0.9,
    });
  }, 420);
}

// ── Component ─────────────────────────────────────────────────────────────────
interface WorkoutCelebrationProps {
  onFinish: () => void;
  finishLabel?: string;
  finishPending?: boolean;
}

export function WorkoutCelebration({ onFinish, finishLabel = "FINISH & RETURN", finishPending = false }: WorkoutCelebrationProps) {
  const message = useRef(getDailyMessage());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so the page has rendered before confetti fires
    const t1 = setTimeout(() => setVisible(true), 80);

    // Read theme primary colour from CSS vars
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    // Convert "h s% l%" → a rough hex for confetti (confetti needs hex)
    // We'll use a bright green fallback if parsing fails
    let primaryHex = "#39ff14";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = `hsl(${raw})`;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      primaryHex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch {}

    const t2 = setTimeout(() => launchFireworks(primaryHex), 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 space-y-8 border-x border-border/30 max-w-2xl mx-auto shadow-2xl"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      {/* Trophy + glow */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 animate-pulse" />
        <div className="relative text-8xl select-none animate-bounce" style={{ animationDuration: "1.4s" }}>🏆</div>
      </div>

      {/* Headline */}
      <div className="space-y-3 text-center">
        <h1
          className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-primary leading-tight"
          style={{ textShadow: "0 0 40px currentColor" }}
        >
          {message.current.headline}
        </h1>
        <p className="text-muted-foreground font-mono text-base text-center max-w-sm leading-relaxed">
          {message.current.sub}
        </p>
      </div>

      {/* Stars row */}
      <div className="flex gap-2 text-2xl animate-in fade-in duration-700 delay-300">
        {["⭐", "⭐", "⭐", "⭐", "⭐"].map((s, i) => (
          <span
            key={i}
            style={{
              animationDelay: `${i * 120}ms`,
              animationDuration: "0.5s",
              animationFillMode: "both",
            }}
            className="animate-in zoom-in"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Finish button */}
      <button
        onClick={onFinish}
        disabled={finishPending}
        className="bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_50px_rgba(57,255,20,0.6)] hover:scale-105 transition-all w-full md:w-auto disabled:opacity-60"
      >
        {finishPending ? "SAVING…" : finishLabel}
      </button>
    </div>
  );
}
