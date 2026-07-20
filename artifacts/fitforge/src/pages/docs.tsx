import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  Dumbbell, LineChart, History, Sparkles, Utensils,
  Activity, HelpCircle, ChevronDown, ChevronRight,
  PlayCircle, Repeat2, Share2, Crown, CheckCircle2, Zap
} from "lucide-react";

/* ─── Prose helpers ─────────────────────────────────────── */
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-extrabold uppercase tracking-tighter text-foreground mt-10 mb-1 first:mt-0">
      {children}
    </h2>
  );
}
function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-6 leading-relaxed">{children}</p>;
}
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <div className="font-bold text-foreground mb-1">{title}</div>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-5">
      <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-foreground leading-relaxed">{children}</p>
    </div>
  );
}
function ProNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-5">
      <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-foreground leading-relaxed">
        <span className="font-bold text-amber-400">Pro feature — </span>{children}
      </p>
    </div>
  );
}
function Divider() {
  return <div className="border-t border-border/50 my-8" />;
}

/* ─── FAQ accordion ─────────────────────────────────────── */
function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-semibold text-foreground text-sm">{q}</span>
        {open
          ? <ChevronDown className="w-4 h-4 text-primary shrink-0" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Section content ────────────────────────────────────── */

function GettingStarted() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">GETTING STARTED</p>
      <H2>Welcome to LiftIQ AI</H2>
      <Lead>LiftIQ AI is your AI personal trainer — it builds your workout plan, tracks every set you lift, charts your strength gains, and coaches you on nutrition and recovery. Here's how to get going in under five minutes.</Lead>

      <Step n={1} title="Set up your profile">
        On first login you'll see the onboarding flow. Tell LiftIQ your fitness goal (muscle gain, fat loss, strength, or endurance), your experience level, how many days a week you can train, and your current weight and height. This is what the AI uses to build your plan — the more accurate you are, the better the plan.
      </Step>
      <Step n={2} title="Generate your AI training plan">
        After onboarding, go to <strong>Protocol</strong> in the sidebar and hit <strong>Generate New Plan</strong>. The AI will build a personalised program — Push/Pull/Legs, Full Body, or Upper/Lower — matched to your goal and schedule. It takes about 10–15 seconds.
      </Step>
      <Step n={3} title="Start your first workout">
        On the <strong>Dashboard</strong>, your next scheduled workout is waiting for you. Tap it to see today's exercises, then hit <strong>Start Workout</strong> to begin logging sets.
      </Step>
      <Step n={4} title="Log sets as you go">
        For each exercise, enter how many reps you actually did and the weight you used, then tap the <strong>✓ (Done)</strong> button. That's it — your progress is saved automatically.
      </Step>

      <Tip>You can update your goal, weight, or schedule anytime in <strong>Settings</strong> and regenerate your plan. Your history is always kept.</Tip>
    </div>
  );
}

function TrainingPlan() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">TRAINING</p>
      <H2>Your Training Plan</H2>
      <Lead>LiftIQ AI builds a structured program around your schedule and goal. Here's everything you need to know about managing it.</Lead>

      <div className="space-y-0 mb-6">
        <FAQ q="How does the AI build my plan?">
          The AI takes your fitness goal, experience level, and how many days per week you can train, then generates a full program — including which days to train, which exercises to do, how many sets and reps to aim for, and target weights. It also writes personalised coach notes explaining its choices.
        </FAQ>
        <FAQ q="Can I regenerate my plan?">
          Yes — go to <strong>Protocol</strong> and tap <strong>Generate New Plan</strong> at any time. Your old plan is archived and your workout history is never deleted.
        </FAQ>
        <FAQ q="What do the different plan types mean?">
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>Push/Pull/Legs (PPL)</strong> — splits training by movement pattern. Best for 4–6 days per week.</li>
            <li><strong>Full Body</strong> — each session trains every major muscle group. Best for 2–3 days per week.</li>
            <li><strong>Upper/Lower</strong> — alternates between upper and lower body days. Best for 4 days per week.</li>
          </ul>
        </FAQ>
        <FAQ q="What if I'm away and can't train on a scheduled day?">
          No worries — just skip it. Your plan doesn't auto-advance. Come back when you're ready and pick up where you left off.
        </FAQ>
      </div>

      <ProNote>AI plan generation is a Pro feature. Free users can log workouts manually using the exercise library.</ProNote>
    </div>
  );
}

function LoggingWorkouts() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">TRAINING</p>
      <H2>Logging Workouts</H2>
      <Lead>The active workout screen is the heart of the app. Here's how everything works once you press Start.</Lead>

      <Step n={1} title='Tap "Start Workout" on any training day'>
        From the Dashboard or Protocol page, tap any day card, then hit <strong>Start Workout</strong>. This locks in the timestamp for your session.
      </Step>
      <Step n={2} title="Work through each exercise">
        The screen shows one exercise at a time with its target — for example "8–12 reps @ 135 lbs". Use the Previous / Next arrows to move between exercises, or work through them in order.
      </Step>
      <Step n={3} title="Enter your actual reps and weight, then tap ✓">
        Type in what you actually lifted. The target is a guide — go heavier if it's too easy, lighter if it's too hard. Tap the green check button to log the set. It turns solid green when saved.
      </Step>
      <Step n={4} title='Hit "Finish Workout" when done'>
        Tap <strong>Finish Workout</strong> at the bottom when you're done. You'll see a celebration screen and then a full summary of your session — duration, total sets, your best lifts, and any new personal records.
      </Step>

      <Divider />

      <div className="flex items-center gap-2 mb-3">
        <Repeat2 className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground uppercase tracking-widest text-sm">Machine Busy? Swap an Exercise</h3>
      </div>
      <Lead>If a piece of equipment is taken, you don't need to wait. Every exercise has a <strong>"Busy?"</strong> button (amber). Tap it to pick a replacement that targets the same muscle group. The swap only lasts for that session — your plan is unchanged.</Lead>

      <div className="space-y-0 mb-6">
        <FAQ q="Does the swap affect my plan for next time?">
          No. Swaps are session-only. Your plan stays exactly as it was — next time you open that workout day, the original exercise will be there.
        </FAQ>
        <FAQ q="Can I swap back mid-session?">
          Yes. Tap the amber <strong>"Re-swap"</strong> button that appears on a swapped exercise to pick a different one.
        </FAQ>
        <FAQ q="What if I don't log all my sets?">
          That's fine — log what you do and tap Finish. Only the sets you ticked off are saved to your history.
        </FAQ>
        <FAQ q="Can I log a workout that's not in my plan?">
          Yes — go to <strong>Library</strong>, find any exercise, and you can log it from there. Or just start a session from any day in your plan and skip to the exercises you want to do.
        </FAQ>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground uppercase tracking-widest text-sm">Sharing Your Workout</h3>
      </div>
      <Lead>After finishing, the Summary Modal lets you share your session. You can post to X/Twitter, Facebook, or Instagram, copy the text, or download a shareable card image. You can also share any past session from the <strong>History</strong> page.</Lead>
    </div>
  );
}

function TrackingProgress() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">PROGRESS</p>
      <H2>Tracking Your Progress</H2>
      <Lead>LiftIQ AI tracks your strength gains over time and charts them so you can see exactly how much stronger you're getting.</Lead>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <LineChart className="w-4 h-4 text-primary" />
          </div>
          <div className="font-bold text-foreground">Strength Charts</div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">Go to <strong>Progress</strong> and pick any exercise from the dropdown. You'll see a chart of how your max weight has changed over every session you've logged it. The delta badge (e.g. "+12.5 lbs") shows your total gain from your first log to your most recent.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="font-bold text-foreground">Body Composition (DEXA)</div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">If you get DEXA scans, upload the PDF in the <strong>DEXA Scans</strong> section. The AI reads the report and extracts your body fat %, lean mass, and visceral fat level. These are plotted over time on the Progress page so you can see how your body composition is changing alongside your strength.</p>
      </div>

      <div className="space-y-0 mb-6">
        <FAQ q="What is a personal record (PR)?">
          A PR is the heaviest weight you've ever logged for a particular exercise. Whenever you beat your previous best, LiftIQ marks the set as a PR and highlights it in your session summary.
        </FAQ>
        <FAQ q="How is the strength chart calculated?">
          LiftIQ uses the Epley formula to estimate your one-rep max (1RM) from the weight and reps you logged. This gives a consistent measure across different rep ranges so you can track true strength progress.
        </FAQ>
        <FAQ q="How do I see my full workout history?">
          Go to <strong>History</strong>. Every completed session is listed in reverse order with the date, which training day it was, how long it took, and how many sets you logged.
        </FAQ>
      </div>
    </div>
  );
}

function AICoaching() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">AI COACHING</p>
      <H2>AI Coaching Features</H2>
      <Lead>Beyond the workout plan, LiftIQ AI includes three more coaching tools powered by the same AI. All three are Pro features.</Lead>

      <div className="space-y-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="font-bold text-foreground">AI Check-in</div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Pro</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">A weekly (or as-needed) check-in where you log your current weight, how your energy and mood have been, and how well you stuck to your plan. The AI reads your recent workout history and your check-in and writes back a personalised coach response — what's going well, what to watch, and one specific thing to focus on.</p>
          <p className="text-xs text-muted-foreground font-mono">Go to: <span className="text-primary">AI Check-in</span> in the sidebar</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Utensils className="w-5 h-5 text-primary" />
            <div className="font-bold text-foreground">AI Diet Plan</div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Pro</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">Tell LiftIQ your nutrition goal (bulk, cut, or maintain), any dietary restrictions, and your target calorie intake. The AI generates a 7-day meal plan with per-meal breakdowns and daily macro targets (protein, carbs, fat) tailored to your training goal.</p>
          <p className="text-xs text-muted-foreground font-mono">Go to: <span className="text-primary">Diet</span> in the sidebar</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <div className="font-bold text-foreground">DEXA Scan Parsing</div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded">Free</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">Got a DEXA scan report as a PDF? Upload it and the AI reads it for you — extracting body fat %, lean mass, and visceral fat level and saving them to your body composition history. No manual data entry.</p>
          <p className="text-xs text-muted-foreground font-mono">Go to: <span className="text-primary">DEXA Scans</span> in the sidebar</p>
        </div>
      </div>

      <div className="space-y-0">
        <FAQ q="How often should I do a check-in?">
          Once a week is ideal — Sunday evenings work well for most people. But you can do one any time you want feedback, especially if you've had a rough week or hit a plateau.
        </FAQ>
        <FAQ q="How long does the AI take to generate my diet plan?">
          Usually 5–10 seconds. Once generated, it's saved so you can view it instantly. Hit <strong>Regenerate</strong> any time you want a fresh plan.
        </FAQ>
        <FAQ q="What if I don't have a DEXA scan?">
          No problem — DEXA scans are optional. The strength charts and workout tracking work completely independently. Many gyms and health clinics offer DEXA scans for $30–80 if you're curious.
        </FAQ>
      </div>
    </div>
  );
}

function Subscription() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">ACCOUNT</p>
      <H2>Free vs. Pro</H2>
      <Lead>LiftIQ AI has a free tier with the core workout tracker and a Pro tier that unlocks all the AI coaching features.</Lead>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="font-bold text-foreground mb-4">Free</div>
          <ul className="space-y-2.5 text-sm">
            {[
              "Workout logging (unlimited)",
              "Full exercise library",
              "Workout history",
              "Strength progress charts",
              "DEXA scan uploading & parsing",
              "Workout sharing",
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-primary/40 rounded-2xl p-5 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-primary" />
            <div className="font-bold text-primary">Pro</div>
          </div>
          <ul className="space-y-2.5 text-sm">
            {[
              "Everything in Free",
              "AI training plan generation",
              "AI check-in coaching",
              "AI 7-day diet plan",
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-0">
        <FAQ q="How do I upgrade to Pro?">
          Go to <strong>Pricing</strong> in the sidebar and hit the Subscribe button. You'll be taken to a secure Stripe checkout. Once payment is complete, Pro features unlock instantly.
        </FAQ>
        <FAQ q="How do I cancel or manage my subscription?">
          Go to <strong>Settings</strong> and tap <strong>Manage Subscription</strong>. This opens the Stripe billing portal where you can cancel, change plans, or update your payment method. You keep Pro access until the end of your current billing period.
        </FAQ>
        <FAQ q="Is my payment information secure?">
          Yes — LiftIQ AI never stores your card details. All payments are processed by Stripe, a PCI-certified payment provider used by millions of businesses.
        </FAQ>
      </div>
    </div>
  );
}

function FrequentlyAsked() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">FAQ</p>
      <H2>Frequently Asked Questions</H2>
      <Lead>Can't find what you're looking for in the other sections? Check here.</Lead>

      <FAQ q="Does LiftIQ work offline?">
        The mobile app caches your training plan and today's workout so you can still see your exercises even if the gym has no signal. An "Offline" banner appears at the top when you're using cached data. Set logging does require a connection to save.
      </FAQ>
      <FAQ q="How do I change my fitness goal or schedule?">
        Go to <strong>Settings</strong>, update your goal, experience level, or days per week, then go to <strong>Protocol</strong> and regenerate your plan. Your history is never affected.
      </FAQ>
      <FAQ q="Can I use LiftIQ AI on my phone?">
        Yes — there's a full iOS and Android app available. It has the same workout logging, history, and progress charts as the web app, plus native haptic feedback and the ability to share workouts via the OS share sheet.
      </FAQ>
      <FAQ q="Will the AI change my plan as I get stronger?">
        Not automatically — but you can regenerate your plan at any time. When you do, the AI considers your updated profile. For best results, update your weight and experience level in Settings before regenerating.
      </FAQ>
      <FAQ q="What exercises are in the library?">
        The library covers all major compound and isolation movements across every muscle group, including barbell, dumbbell, cable, machine, and bodyweight exercises. You can search by name or browse by muscle group.
      </FAQ>
      <FAQ q="What if the AI generates a plan that's too hard or too easy?">
        You can always regenerate. Try adjusting your experience level in Settings — drop it down if the plan feels too intense, or bump it up if it's not challenging enough. You can also swap individual exercises during a session using the "Busy?" button.
      </FAQ>
      <FAQ q="How do I delete my account or data?">
        Reach out via the support link in Settings. We'll remove your account and all associated data within 30 days.
      </FAQ>
    </div>
  );
}

/* ─── Section definitions ────────────────────────────────── */
const SECTIONS = [
  { id: "start",    label: "Getting Started",   icon: PlayCircle,  component: GettingStarted },
  { id: "plan",     label: "Training Plan",      icon: Dumbbell,    component: TrainingPlan },
  { id: "logging",  label: "Logging Workouts",   icon: CheckCircle2, component: LoggingWorkouts },
  { id: "progress", label: "Tracking Progress",  icon: LineChart,   component: TrackingProgress },
  { id: "ai",       label: "AI Coaching",        icon: Sparkles,    component: AICoaching },
  { id: "pro",      label: "Free vs. Pro",       icon: Crown,       component: Subscription },
  { id: "faq",      label: "FAQ",                icon: HelpCircle,  component: FrequentlyAsked },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

/* ─── Page ───────────────────────────────────────────────── */
export default function Docs() {
  const [active, setActive] = useState<SectionId>("start");
  const Section = SECTIONS.find(s => s.id === active)!.component;

  return (
    <Layout>
      <div className="flex gap-8 min-h-[80vh]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-1 sticky top-8 self-start">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-3">
            Help Center
          </div>
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(57,255,20,0.2)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </aside>

        {/* Mobile picker */}
        <div className="lg:hidden mb-6 w-full">
          <select
            value={active}
            onChange={e => setActive(e.target.value as SectionId)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground"
          >
            {SECTIONS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20">
          <Section />
        </main>
      </div>
    </Layout>
  );
}
