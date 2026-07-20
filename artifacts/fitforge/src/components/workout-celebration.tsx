import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// ── Message pool — varied tone, paired with an emoji visual ──────────────────
const CELEBRATIONS = [
  {
    emoji: "🔥💪🔥",
    headline: "ABSOLUTELY ON FIRE",
    sub: "You didn't just show up — you showed OUT. That's a different level.",
  },
  {
    emoji: "🏆",
    headline: "CHAMPION BEHAVIOUR",
    sub: "Most people skip. You didn't. That gap is where greatness lives.",
  },
  {
    emoji: "🦁",
    headline: "THE LION IS FED",
    sub: "Respect the grind. Today you were a straight-up animal.",
  },
  {
    emoji: "⚡️⚡️⚡️",
    headline: "PURE ELECTRICITY",
    sub: "The energy you brought today? Completely unmatched.",
  },
  {
    emoji: "🚀",
    headline: "LAUNCHING DIFFERENT",
    sub: "Every session like this is rocket fuel for your future self.",
  },
  {
    emoji: "💎",
    headline: "DIAMOND WORK ETHIC",
    sub: "Forged under pressure. That's what you are.",
  },
  {
    emoji: "🌊",
    headline: "UNSTOPPABLE FORCE",
    sub: "Like water — relentless, powerful, impossible to hold back.",
  },
  {
    emoji: "🦅",
    headline: "ELEVATION ACHIEVED",
    sub: "While they rest, you rise. The view from up here? Earned.",
  },
  {
    emoji: "⚔️",
    headline: "WARRIOR PROTOCOL: DONE",
    sub: "You fought the resistance and won. Every. Single. Rep.",
  },
  {
    emoji: "🎯",
    headline: "LOCKED IN & DELIVERED",
    sub: "Focused. Disciplined. Lethal. That's what today looked like.",
  },
  {
    emoji: "🌋",
    headline: "VOLCANIC OUTPUT",
    sub: "The force you put into that session? It moved mountains.",
  },
  {
    emoji: "🧠💪",
    headline: "MIND & MUSCLE ALIGNED",
    sub: "When your brain and body sync up like that — nothing can stop you.",
  },
  {
    emoji: "👑",
    headline: "ROYALTY IN THE GYM",
    sub: "Not everyone gets a crown. Yours was earned in this session.",
  },
  {
    emoji: "🌟🌟🌟",
    headline: "STELLAR PERFORMANCE",
    sub: "Some sessions are just different. This was one of them.",
  },
  {
    emoji: "🐉",
    headline: "DRAGON ENERGY UNLEASHED",
    sub: "Rare. Powerful. Impossible to ignore. That's your energy today.",
  },
  {
    emoji: "💥",
    headline: "DETONATED IT",
    sub: "You walked in with a plan and blew the doors off. Incredible.",
  },
  {
    emoji: "🏔️",
    headline: "SUMMIT MENTALITY",
    sub: "The peak belongs to those who keep climbing. Today you climbed.",
  },
  {
    emoji: "🎖️",
    headline: "DECORATED TODAY",
    sub: "Not every soldier gets a medal. Today you earned yours.",
  },
  {
    emoji: "🌅",
    headline: "BUILT FOR THIS MOMENT",
    sub: "Today's effort is tomorrow's strength. You're building something real.",
  },
  {
    emoji: "🤯",
    headline: "GENUINELY IMPRESSIVE",
    sub: "If someone watched that session, their jaw would be on the floor.",
  },
];

// Pick once per mount, randomly
function pickRandom() {
  return CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
}

// ── Fireworks ─────────────────────────────────────────────────────────────────
function launchFireworks(primaryHex: string) {
  const colors = [primaryHex, "#FFD700", "#ffffff", "#ff4e50", "#a855f7"];

  // Big opening burst
  confetti({ particleCount: 140, spread: 90, origin: { x: 0.5, y: 0.5 }, colors, startVelocity: 50, gravity: 0.85, scalar: 1.15, shapes: ["star", "circle"] });

  // Side cannons
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 55, spread: 60, origin: { x: 0, y: 0.6 }, colors, startVelocity: 55 });
    confetti({ particleCount: 70, angle: 125, spread: 60, origin: { x: 1, y: 0.6 }, colors, startVelocity: 55 });
  }, 350);

  // Sustained rockets
  const end = Date.now() + 3500;
  const interval = setInterval(() => {
    if (Date.now() > end) { clearInterval(interval); return; }
    confetti({
      particleCount: 40,
      angle: 85 + (Math.random() - 0.5) * 50,
      spread: 50,
      origin: { x: 0.15 + Math.random() * 0.7, y: 1 },
      colors,
      startVelocity: 60 + Math.random() * 25,
      gravity: 0.8,
      scalar: 0.95,
    });
  }, 400);
}

// ── Component ─────────────────────────────────────────────────────────────────
interface WorkoutCelebrationProps {
  onFinish: () => void;
  finishPending?: boolean;
}

export function WorkoutCelebration({ onFinish, finishPending = false }: WorkoutCelebrationProps) {
  const celebration = useRef(pickRandom());

  useEffect(() => {
    // Derive theme primary as hex for confetti
    let primaryHex = "#39ff14";
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = `hsl(${raw})`;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      primaryHex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch {}

    const t = setTimeout(() => launchFireworks(primaryHex), 150);
    return () => clearTimeout(t);
  }, []);

  const { emoji, headline, sub } = celebration.current;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 gap-8 border-x border-border/30 max-w-2xl mx-auto shadow-2xl animate-in fade-in duration-500">

      {/* Big emoji visual */}
      <div className="relative flex items-center justify-center">
        <div className="absolute rounded-full bg-primary/15 blur-3xl w-48 h-48 animate-pulse" />
        <div
          className="relative select-none leading-none"
          style={{ fontSize: "clamp(5rem, 18vw, 9rem)", filter: "drop-shadow(0 0 32px rgba(255,215,0,0.5))" }}
        >
          {emoji}
        </div>
      </div>

      {/* Text */}
      <div className="space-y-4 text-center">
        <h1
          className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-primary leading-tight"
          style={{ textShadow: "0 0 48px currentColor" }}
        >
          {headline}
        </h1>
        <p className="text-muted-foreground font-mono text-base max-w-sm mx-auto leading-relaxed">
          {sub}
        </p>
      </div>

      {/* Finish button */}
      <button
        onClick={onFinish}
        disabled={finishPending}
        className="bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.7)] hover:scale-105 transition-all w-full md:w-auto disabled:opacity-60 text-lg"
      >
        {finishPending ? "SAVING…" : "SEE MY STATS →"}
      </button>
    </div>
  );
}
