import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  BookOpen, Monitor, Smartphone, Server, Database, Sparkles,
  CreditCard, WifiOff, Palette, ChevronRight, ExternalLink,
  Globe, Zap, Shield, Code2
} from "lucide-react";

/* ─────────────────────────────────────────────
   Shared prose components
───────────────────────────────────────────── */
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-extrabold uppercase tracking-tighter text-foreground mt-10 mb-4 first:mt-0">
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold uppercase tracking-widest text-primary mt-8 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground leading-relaxed mb-3">{children}</p>;
}
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-primary">{children}</code>;
}
function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted border border-border rounded-xl p-4 text-xs font-mono text-foreground overflow-x-auto mb-4 leading-relaxed">
      {children}
    </pre>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-6 font-mono text-xs uppercase tracking-widest text-primary">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-6 text-muted-foreground align-top">
                  {typeof cell === "string" ? <span className={j === 0 ? "font-mono text-foreground text-xs" : ""}>{cell}</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Badge({ children, color = "primary" }: { children: React.ReactNode; color?: "primary" | "amber" | "muted" }) {
  const cls = {
    primary: "bg-primary/10 text-primary border-primary/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    muted: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <span className={`inline-block font-mono text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded ${cls}`}>
      {children}
    </span>
  );
}
function Callout({ icon: Icon, children, color = "primary" }: { icon: React.ElementType; children: React.ReactNode; color?: "primary" | "amber" }) {
  const cls = color === "amber"
    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
    : "bg-primary/10 border-primary/30 text-foreground";
  return (
    <div className={`flex gap-3 p-4 rounded-xl border mb-4 ${cls}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-current opacity-70" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
function Divider() {
  return <div className="border-t border-border/50 my-8" />;
}

/* ─────────────────────────────────────────────
   Section content components
───────────────────────────────────────────── */

function SectionOverview() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-primary font-mono text-xs tracking-widest mb-2">SYSTEM DOCUMENTATION</p>
        <h1 className="text-5xl font-extrabold uppercase tracking-tighter leading-none mb-4">LiftIQ AI</h1>
        <P>AI-powered personal training platform — web app, mobile app, and REST API backed by PostgreSQL. This documentation covers every feature, every screen, and every endpoint.</P>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: Monitor, label: "Web App", desc: "13 pages covering the full training lifecycle" },
          { icon: Smartphone, label: "Mobile App", desc: "6 tabs + session screen with offline support" },
          { icon: Server, label: "API Reference", desc: "All REST endpoints with request/response shapes" },
          { icon: Database, label: "Data Model", desc: "14 PostgreSQL tables, column by column" },
          { icon: Sparkles, label: "AI Features", desc: "4 OpenAI-powered capabilities" },
          { icon: CreditCard, label: "Billing", desc: "Stripe subscriptions, gating, go-live checklist" },
          { icon: WifiOff, label: "Offline Support", desc: "AsyncStorage caching strategy on mobile" },
          { icon: Palette, label: "Theming", desc: "6 accent colours + flash-prevention" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm mb-0.5">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2>Architecture</H2>
      <CodeBlock>{`Browser / Mobile
      │
      ▼
artifacts/fitforge          React + Vite SPA (web)
artifacts/fitforge-mobile   Expo React Native (iOS / Android)
      │
      ▼ REST
artifacts/api-server        Express 5 API
      │
      ▼
lib/db                      Drizzle ORM + PostgreSQL
lib/api-spec                OpenAPI spec (source of truth for codegen)
lib/api-client-react        Orval-generated React Query hooks`}</CodeBlock>

      <H3>Shared libraries</H3>
      <Table
        headers={["Package", "Purpose"]}
        rows={[
          ["@workspace/db", "Drizzle schema, migrations, query helpers"],
          ["@workspace/api-spec", "OpenAPI YAML + Orval codegen config"],
          ["@workspace/api-client-react", "Generated hooks + Zod schemas used by both apps"],
        ]}
      />

      <H2>Running locally</H2>
      <CodeBlock>{`# API server
pnpm --filter @workspace/api-server run dev

# Web app
pnpm --filter @workspace/fitforge run dev

# Mobile app
pnpm --filter @workspace/fitforge-mobile run dev

# Regenerate API hooks after spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Full typecheck
pnpm run typecheck`}</CodeBlock>

      <Callout icon={Shield} color="amber">
        Required env vars: <Code>DATABASE_URL</Code>, <Code>SESSION_SECRET</Code>, <Code>STRIPE_SECRET_KEY</Code>, <Code>AI_INTEGRATIONS_OPENAI_API_KEY</Code>, <Code>AI_INTEGRATIONS_OPENAI_BASE_URL</Code>
      </Callout>
    </div>
  );
}

function SectionWebApp() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">PLATFORM</p>
      <H2>Web App</H2>
      <P>React + Vite single-page application. All routes are client-side via Wouter. Auth is session-based via the API server. The sidebar collapses to icons on narrow viewports; a fixed bottom nav bar appears on mobile.</P>

      <Divider />
      <H3>Dashboard — <Code>/</Code></H3>
      <P>Main hub after login. Shows training streak, today's workout card, stats strip (sessions, sets, plan name), quick-action links, and the next 2–3 upcoming training days.</P>

      <H3>Onboarding — <Code>/onboarding</Code></H3>
      <P>First-run wizard. Collects fitness goal, experience level, days per week, weight, and height. Redirects to <Code>/plan</Code> and auto-triggers AI plan generation on completion.</P>

      <H3>Plan — <Code>/plan</Code></H3>
      <P>Displays the active training plan with all workout days. "Generate new plan" calls the AI; requires Pro subscription. Each day card links to Day Detail.</P>

      <H3>Day Detail — <Code>/day/:id</Code></H3>
      <P>Pre-workout read-only overview. Lists exercises, muscle groups, equipment, and prescribed sets × reps × weight. "Start Workout" navigates to Active Workout.</P>

      <H3>Active Workout — <Code>/workout/:id</Code></H3>
      <P>One exercise shown at a time. Editable reps and weight fields, log-set button, auto-starting rest timer, Previous/Next navigation. Finish triggers the Celebration screen then the Summary Modal.</P>

      <div className="bg-muted/40 border border-border rounded-xl p-5 mb-6 space-y-2 text-sm">
        <div className="font-bold text-foreground mb-2 font-mono text-xs uppercase tracking-widest">Workout sub-features</div>
        {[
          ["Machine Busy? / Swap", "Amber button per exercise. Opens exercise picker filtered to same muscle group. Swap is session-only — never persisted. SWAPPED badge + struck-through original."],
          ["Workout Celebration", "Full-screen dark overlay, random motivational message (20-item pool), canvas-confetti in accent colour, 'SEE MY STATS →' button."],
          ["Workout Summary Modal", "Duration, sets, highest weight lifted, PRs, per-exercise max. Share to X, Facebook, Instagram, OS share sheet, copy text, or download PNG card."],
        ].map(([name, desc]) => (
          <div key={name as string} className="flex gap-3">
            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div><span className="font-semibold text-foreground">{name}</span> — <span className="text-muted-foreground">{desc}</span></div>
          </div>
        ))}
      </div>

      <H3>History — <Code>/history</Code></H3>
      <P>Reverse-chronological session log styled as "COMBAT LOG". Each row has a Share button that lazy-fetches the full session and opens the Summary Modal.</P>

      <H3>Progress — <Code>/progress</Code></H3>
      <P>Estimated 1RM trend charts (Epley formula) per exercise, plus DEXA body-composition charts (body fat %, lean mass, visceral fat) over time. Powered by Recharts with themed colours.</P>

      <H3>DEXA — <Code>/dexa</Code></H3>
      <P>Upload a DEXA PDF; AI extracts body fat %, lean mass, visceral fat level, and scan date. Scan history table with delete. Affiliate provider cards.</P>

      <H3>Check-in — <Code>/checkin</Code></H3>
      <P>Periodic subjective check-in: weight, mood (1–5), energy (1–5), adherence %, free-text notes. AI generates personalised coach feedback. <Badge color="amber">Pro</Badge></P>

      <H3>Diet — <Code>/diet</Code></H3>
      <P>Dietary preferences (goal, restrictions, calorie target) + AI-generated 7-day meal plan with per-meal macros. <Badge color="amber">Pro</Badge></P>

      <H3>Library — <Code>/library</Code></H3>
      <P>Searchable exercise database. Search by name or muscle group. Each card shows name, muscle group, equipment, and full instructions.</P>

      <H3>Pricing — <Code>/pricing</Code></H3>
      <P>Free vs. Pro feature comparison. Subscribe button creates a Stripe Checkout session. Manage Subscription opens the Stripe Billing Portal.</P>

      <H3>Settings — <Code>/settings</Code></H3>
      <P>Edit profile fields. Accent colour picker (6 presets) persisted to <Code>localStorage</Code> as <Code>liftiq-theme</Code>. Subscription status badge and billing portal link.</P>

      <Divider />
      <H2>Global Components</H2>
      <Table
        headers={["Component", "What it does"]}
        rows={[
          ["Layout / Sidebar", "Wordmark, nav links, Pro badge, collapses to icon-only. Mobile bottom tab bar shows first 5 links."],
          ["Subscription gating", "Reads GET /api/stripe/status; shows lock overlay + redirect to /pricing for Pro-only features on Free tier."],
          ["Theme system", "Blocking inline script in index.html reads localStorage before paint; see Theming section."],
        ]}
      />
    </div>
  );
}

function SectionMobileApp() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">PLATFORM</p>
      <H2>Mobile App</H2>
      <P>Expo React Native app using Expo Router for file-based navigation. Targets iOS and Android. Shares the same API server as the web app.</P>

      <Divider />
      <H3>Dashboard — <Code>/(tabs)/index</Code></H3>
      <P>Root tab. Personalised greeting, training streak, stats strip (total sessions, this-week sessions, total sets), active plan card, and next workout deep-link.</P>

      <H3>Workout Plan — <Code>/(tabs)/workout</Code></H3>
      <P>Detailed active plan view with all training days. Pull-to-refresh. Falls back to AsyncStorage cache when offline — amber Offline Banner appears.</P>

      <H3>Progress — <Code>/(tabs)/progress</Code></H3>
      <P>SVG line charts showing max weight per session date per exercise. Bottom-sheet exercise picker. Delta badge shows gain/loss between first and most recent log (e.g. "+12.5 lbs").</P>

      <H3>History — <Code>/(tabs)/history</Code></H3>
      <P>Reverse-chronological session list. Native OS share sheet per session — share text format: <Code>💪 Just crushed {"{day}"} on LiftIQ AI! … Track yours → liftiq.ai</Code></P>

      <H3>Profile — <Code>/(tabs)/profile</Code></H3>
      <P>Inline-editable biometrics and training preferences. Changes saved immediately via the API.</P>

      <H3>Session Screen — <Code>/session/[dayId]</Code></H3>
      <P>Core active-workout experience. Handles session lifecycle, real-time set logging with haptic feedback, exercise swapping, and the post-workout celebration flow.</P>

      <div className="bg-muted/40 border border-border rounded-xl p-5 mb-6 space-y-2 text-sm">
        <div className="font-bold text-foreground mb-2 font-mono text-xs uppercase tracking-widest">Session sub-features</div>
        {[
          ["Set logging", "Editable reps + weight per set. Log button marks set green + light haptic. Progress counter in header (e.g. '6/12 sets')."],
          ["Machine Busy? / Swap", "Amber 'Busy?' button per exercise while session is active. Bottom-sheet picker filtered to same muscle group, searchable. Re-swap button available."],
          ["Celebration modal", "Full-screen, random motivational message, spring animation, haptic burst (Success → Heavy × 3 → Medium × 2 → Light)."],
          ["Offline support", "Workout day data cached per dayId. Banner shown if API unreachable. Cache resets immediately on dayId change."],
        ].map(([name, desc]) => (
          <div key={name as string} className="flex gap-3">
            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div><span className="font-semibold text-foreground">{name}</span> — <span className="text-muted-foreground">{desc}</span></div>
          </div>
        ))}
      </div>

      <Divider />
      <H2>Components</H2>
      <Table
        headers={["Component", "Purpose"]}
        rows={[
          ["CelebrationModal", "Full-screen post-workout celebration. Props: visible, message, onDismiss."],
          ["SwapExerciseModal", "Bottom-sheet exercise picker. Props: visible, targetMuscleGroup, onSelect, onClose."],
          ["OfflineBanner", "Amber strip shown when cached data is active. Self-contained, no props."],
          ["WorkoutDayCard", "Navigational card for a training day. Props: dayNumber, label, focus, onPress."],
          ["StatCard", "Key-metric display used in Dashboard."],
          ["SessionCard", "History row component with share button."],
        ]}
      />

      <H2>Hooks</H2>
      <Table
        headers={["Hook", "Returns"]}
        rows={[
          ["useOfflinePlan()", "{ plan, isLoading, isError, isOffline, refetch, isRefetching }"],
          ["useOfflineWorkoutDay(dayId)", "{ day, isLoading, isError, isOffline }"],
          ["useColors()", "Theme-aware colour tokens object"],
        ]}
      />
    </div>
  );
}

function SectionAPI() {
  const endpoint = (method: string, path: string, desc: string, pro?: boolean) => (
    <div key={path} className="mb-4">
      <div className="flex items-start gap-3 mb-1.5">
        <span className={`font-mono text-[11px] font-black px-2 py-0.5 rounded shrink-0 mt-0.5 ${
          method === "GET" ? "bg-blue-500/20 text-blue-400" :
          method === "POST" ? "bg-green-500/20 text-green-400" :
          method === "PATCH" ? "bg-amber-500/20 text-amber-400" :
          "bg-red-500/20 text-red-400"
        }`}>{method}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-xs text-foreground">{path}</code>
            {pro && <Badge color="amber">Pro</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">BACKEND</p>
      <H2>API Reference</H2>
      <P>Base URL (dev): <Code>http://localhost:5000/api</Code>. All endpoints return JSON. Authentication is session-cookie based via Replit Auth / OpenID Connect.</P>

      <Callout icon={Code2}>
        The OpenAPI spec at <Code>lib/api-spec/</Code> is the single source of truth. After any endpoint change, run <Code>pnpm --filter @workspace/api-spec run codegen</Code> to regenerate the React Query hooks.
      </Callout>

      <H3>Profile</H3>
      {endpoint("GET", "/api/profile", "Returns the authenticated user's profile — weight, height, goal, experience, days per week.")}
      {endpoint("POST", "/api/profile", "Creates or updates the user's profile.")}

      <H3>Plans</H3>
      {endpoint("GET", "/api/plans", "Lists all workout plans for the authenticated user.")}
      {endpoint("GET", "/api/plans/active", "Returns the currently active plan with all days.")}
      {endpoint("GET", "/api/plans/:planId", "Returns a specific plan with full day and exercise detail.")}
      {endpoint("POST", "/api/plans/generate", "AI generates a personalised training program from the user's profile.", true)}

      <H3>Workout Days</H3>
      {endpoint("GET", "/api/days/:dayId", "Returns a day with exercise groups, exercises, and prescribed sets.")}

      <H3>Sessions</H3>
      {endpoint("GET", "/api/sessions", "Lists completed and in-progress sessions (reverse chronological).")}
      {endpoint("POST", "/api/sessions", "Starts a new session. Body: { dayId }.")}
      {endpoint("GET", "/api/sessions/:sessionId", "Returns a session with all logged sets.")}
      {endpoint("PATCH", "/api/sessions/:sessionId", "Updates a session — used to set completedAt.")}
      {endpoint("POST", "/api/sessions/:sessionId/sets", "Logs a completed set. Returns the set record including isPersonalRecord.")}

      <H3>Exercises</H3>
      {endpoint("GET", "/api/exercises", "Lists all exercises. Optional query params: muscleGroup, search.")}
      {endpoint("GET", "/api/exercises/:id", "Returns a single exercise with full instructions.")}
      {endpoint("GET", "/api/exercises/:id/alternates", "Returns exercises in the same muscle group (for swapping).")}

      <H3>Exercise Maxes (PRs)</H3>
      {endpoint("GET", "/api/exercise-maxes", "Returns the user's personal records across all exercises.")}
      {endpoint("POST", "/api/exercise-maxes", "Manually records a personal best.")}

      <H3>Progress</H3>
      {endpoint("GET", "/api/progress/weights", "Time-series estimated 1RM data per exercise. Query param: exerciseId (required).")}

      <H3>DEXA Scans</H3>
      {endpoint("GET", "/api/dexa-scans", "Lists the user's DEXA scan records.")}
      {endpoint("POST", "/api/dexa-scans/parse", "Uploads a DEXA PDF (multipart/form-data); AI extracts body composition values.")}
      {endpoint("DELETE", "/api/dexa-scans/:id", "Deletes a scan record.")}

      <H3>Check-ins</H3>
      {endpoint("GET", "/api/checkins", "Lists all check-ins for the user.")}
      {endpoint("POST", "/api/checkins", "Submits a check-in; AI generates a coach feedback response.", true)}

      <H3>Diet</H3>
      {endpoint("GET", "/api/diet/preferences", "Returns the user's current dietary preferences.")}
      {endpoint("POST", "/api/diet/preferences", "Saves dietary preferences (goal, restrictions, targetCalories).")}
      {endpoint("GET", "/api/diet/recommendations", "Returns AI-generated meal plan and macro targets.", true)}

      <H3>Dashboard</H3>
      {endpoint("GET", "/api/dashboard/summary", "Aggregates streak, session counts, set count, active plan name, next workout.")}

      <H3>Billing (Stripe)</H3>
      {endpoint("GET", "/api/stripe/status", "Returns { isPro, plan, currentPeriodEnd }.")}
      {endpoint("POST", "/api/stripe/checkout", "Creates a Checkout session. Body: { priceId }.")}
      {endpoint("POST", "/api/stripe/portal", "Creates a Billing Portal session.")}
      {endpoint("POST", "/api/stripe/webhook", "Stripe webhook handler (internal — not called by clients).")}
    </div>
  );
}

function SectionDataModel() {
  const col = (name: string, type: string, notes: string) => [
    <Code>{name}</Code>, type, notes
  ];

  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">BACKEND</p>
      <H2>Data Model</H2>
      <P>Schema lives in <Code>lib/db/src/schema/</Code>. Drizzle ORM handles all queries and migrations. Push changes to dev with <Code>pnpm --filter @workspace/db run push</Code>.</P>

      <H3>user_profiles</H3>
      <P>One row per authenticated user.</P>
      <Table headers={["Column", "Type", "Notes"]} rows={[
        col("id", "integer PK", "Auto-increment"),
        col("user_id", "text", "Replit / OpenID user identifier — unique"),
        col("display_name", "text", ""),
        col("weight_lbs", "numeric", "Current body weight"),
        col("height_in", "integer", "Height in inches"),
        col("age", "integer", ""),
        col("fitness_goal", "text", "muscle_gain | fat_loss | strength | endurance"),
        col("experience_level", "text", "beginner | intermediate | advanced"),
        col("days_per_week", "integer", "Training frequency preference"),
        col("stripe_customer_id", "text", "Populated on first Stripe interaction"),
        col("stripe_subscription_id", "text", "Active subscription ID"),
        col("is_pro", "boolean", "Denormalised for fast gating checks"),
        col("created_at", "timestamp", ""),
      ]} />

      <H3>workout_plans</H3>
      <Table headers={["Column", "Type", "Notes"]} rows={[
        col("id", "integer PK", ""),
        col("user_id", "text", "FK → user_profiles"),
        col("name", "text", 'e.g. "PPL Hypertrophy"'),
        col("plan_type", "text", "ppl | full_body | upper_lower"),
        col("is_active", "boolean", "Only one plan active per user"),
        col("ai_notes", "text", "Coach notes from generation prompt"),
      ]} />

      <H3>workout_days</H3>
      <Table headers={["Column", "Type", "Notes"]} rows={[
        col("id", "integer PK", ""),
        col("plan_id", "integer", "FK → workout_plans"),
        col("day_number", "integer", "Ordering within the week"),
        col("label", "text", 'e.g. "Push A"'),
        col("focus", "text", 'e.g. "Chest / Shoulders / Triceps"'),
        col("rest_seconds", "integer", "Default rest between sets"),
      ]} />

      <H3>workout_exercises + prescribed_sets</H3>
      <P>Junction between exercise groups and the library. Each <Code>workout_exercise</Code> has many <Code>prescribed_sets</Code> with target reps range, target weight, and rest seconds.</P>

      <H3>exercises</H3>
      <P>Master exercise library (seeded). Columns: <Code>name</Code>, <Code>muscle_group</Code>, <Code>equipment</Code>, <Code>instructions</Code>, <Code>video_url</Code>.</P>

      <H3>workout_sessions + logged_sets</H3>
      <Table headers={["Column", "Type", "Notes"]} rows={[
        col("session.started_at", "timestamp", ""),
        col("session.completed_at", "timestamp", "null while in progress"),
        col("set.actual_reps", "integer", ""),
        col("set.actual_weight_lbs", "numeric", "null for bodyweight"),
        col("set.is_personal_record", "boolean", "Computed on insert"),
      ]} />

      <H3>dexa_scans</H3>
      <Table headers={["Column", "Type", "Notes"]} rows={[
        col("scan_date", "date", ""),
        col("body_fat_percent", "numeric", ""),
        col("lean_mass_lbs", "numeric", ""),
        col("visceral_fat_level", "integer", ""),
        col("raw_text", "text", "Original extracted PDF text"),
      ]} />

      <H3>checkins</H3>
      <P>Fields: <Code>weight_lbs</Code>, <Code>mood</Code> (1–5), <Code>energy</Code> (1–5), <Code>adherence_percent</Code>, <Code>notes</Code>, <Code>ai_response</Code>.</P>

      <H3>diet_profiles + diet_recommendations</H3>
      <P>Preferences: <Code>goal</Code>, <Code>restrictions</Code> (text[]), <Code>target_calories</Code>. Recommendations: <Code>content</Code> (jsonb) — structured meal plan cached per user.</P>
    </div>
  );
}

function SectionAI() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">AI SYSTEMS</p>
      <H2>AI Features</H2>
      <P>LiftIQ AI uses OpenAI (GPT-4o) via Replit's AI Integrations proxy. The API key is server-side only — never exposed to the client.</P>
      <Callout icon={Shield} color="amber">
        All Pro-only AI endpoints are protected by the <Code>requirePro</Code> middleware. Free-tier calls return <Code>403 Forbidden</Code>.
      </Callout>

      <Divider />
      <H3>1 — Workout Plan Generation</H3>
      <div className="flex gap-2 mb-3 flex-wrap"><Badge>POST /api/plans/generate</Badge><Badge color="amber">Pro</Badge></div>
      <P>Generates a personalised multi-week resistance training program as structured JSON — days, exercise groups, prescribed sets, rep ranges, target weights, and coach notes. The previous active plan is deactivated.</P>
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm mb-4">
        <div className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Prompt inputs</div>
        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
          <li>Fitness goal (muscle gain / fat loss / strength / endurance)</li>
          <li>Experience level (beginner / intermediate / advanced)</li>
          <li>Days per week available</li>
          <li>Current weight and height (for weight-selection heuristics)</li>
        </ul>
      </div>

      <H3>2 — DEXA Scan PDF Parsing</H3>
      <div className="flex gap-2 mb-3 flex-wrap"><Badge>POST /api/dexa-scans/parse</Badge><Badge color="muted">Free</Badge></div>
      <P>Extracts body fat %, lean mass (lbs), visceral fat level, and scan date from uploaded DEXA PDF text. Raw text is stored alongside extracted values for auditability. Fields the AI cannot determine are returned as <Code>null</Code>.</P>

      <H3>3 — AI Check-in Feedback</H3>
      <div className="flex gap-2 mb-3 flex-wrap"><Badge>POST /api/checkins</Badge><Badge color="amber">Pro</Badge></div>
      <P>After a check-in is submitted, the server sends the data plus recent session history and the current plan to the AI. Returns a 3–5 sentence personalised coach response — acknowledging metrics, flagging concerns, giving one actionable suggestion. Stored in <Code>checkins.ai_response</Code>.</P>

      <H3>4 — AI Diet Recommendations</H3>
      <div className="flex gap-2 mb-3 flex-wrap"><Badge>GET /api/diet/recommendations</Badge><Badge color="amber">Pro</Badge></div>
      <P>Takes dietary preferences (goal, restrictions, calorie target) plus body weight and generates a structured 7-day meal plan with per-meal breakdowns, calorie and macro targets, and a brief rationale. Cached in <Code>diet_recommendations</Code> until the user regenerates.</P>

      <Divider />
      <Callout icon={Zap}>
        To add a new AI feature: create the endpoint in <Code>artifacts/api-server/src/routes/</Code>, use the shared <Code>openai</Code> client (already configured with the proxy base URL), add <Code>requirePro</Code> middleware if needed, update the OpenAPI spec, run codegen, then update these docs.
      </Callout>
    </div>
  );
}

function SectionBilling() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">MONETISATION</p>
      <H2>Billing & Subscriptions</H2>
      <P>Stripe powers subscription billing via Replit's native Stripe connector. Subscription state is denormalised to <Code>user_profiles.is_pro</Code> for fast middleware checks.</P>

      <H3>Plans</H3>
      <Table headers={["Tier", "Price", "Features"]} rows={[
        ["Free", "$0 / month", "Exercise library, manual logging, history, basic progress charts"],
        ["Pro", "Set in Stripe Dashboard", "Everything in Free + AI plan generation, AI check-in, AI diet, DEXA parsing"],
      ]} />

      <H3>Flow</H3>
      <CodeBlock>{`Client                API Server              Stripe
  │                       │                     │
  │  POST /stripe/checkout │                     │
  ├──────────────────────►│  Create checkout    │
  │                       ├────────────────────►│
  │◄──────────────────────┤  { url }            │
  │  Redirect to Stripe   │                     │
  │                       │  webhook event      │
  │                       │◄────────────────────┤
  │                       │  set is_pro=true    │
  │                       ▼                     │
  │                   database                  │`}</CodeBlock>

      <H3>Webhook events handled</H3>
      <Table headers={["Event", "Action"]} rows={[
        ["checkout.session.completed", "Sets is_pro = true, stores stripe_customer_id and stripe_subscription_id"],
        ["customer.subscription.updated", "Updates subscription status"],
        ["customer.subscription.deleted", "Sets is_pro = false"],
      ]} />

      <H3>Go-live checklist</H3>
      <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-2 text-sm">
        {[
          "Replace STRIPE_SECRET_KEY secret with the live key (currently test mode)",
          "Create live Products and Prices in the Stripe Dashboard",
          "Update priceId values in the frontend pricing page",
          "Register POST /api/stripe/webhook in Stripe Dashboard with live signing secret",
          "Add STRIPE_WEBHOOK_SECRET as a secret in Replit",
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded border border-border shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionOffline() {
  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">MOBILE</p>
      <H2>Offline Support</H2>
      <P>The mobile app caches critical workout data to AsyncStorage so users can train in the gym even when the API is unreachable.</P>

      <H3>Strategy: live-first, cache-fallback</H3>
      <CodeBlock>{`App opens
    │
    ├── Kick off API request (React Query)
    ├── Load AsyncStorage cache (async, parallel)
    │
    ├── Cache available?
    │   ├── Yes → show cached data immediately (no spinner)
    │   └── No  → spinner until API responds
    │
    ├── API responds?
    │   ├── Success → replace cached with live data; persist to cache
    │   └── Error   → keep showing cached; show OfflineBanner
    │
    └── isOffline = query.isError && !!cached`}</CodeBlock>

      <P>Data is always served as <Code>query.data ?? cached</Code> — the cache is used as soon as it loads from disk, regardless of network state.</P>

      <H3>Cached data</H3>
      <Table headers={["What", "AsyncStorage key", "Hook"]} rows={[
        ["Active workout plan", "liftiq:active-plan", "useOfflinePlan"],
        ["Workout day detail", "liftiq:workout-day:<dayId>", "useOfflineWorkoutDay"],
      ]} />

      <H3>useOfflinePlan</H3>
      <CodeBlock>{`const { plan, isLoading, isError, isOffline, refetch, isRefetching } = useOfflinePlan();`}</CodeBlock>
      <P>Loads from <Code>liftiq:active-plan</Code> on mount. Persists live data on every successful fetch. <Code>isError</Code> only true when neither live nor cached data is available. <Code>isOffline</Code> shows the banner.</P>

      <H3>useOfflineWorkoutDay</H3>
      <CodeBlock>{`const { day, isLoading, isError, isOffline } = useOfflineWorkoutDay(dayId);`}</CodeBlock>
      <P>Cache key is per <Code>dayId</Code>. When <Code>dayId</Code> changes, cached state resets <em>synchronously</em> before the async disk read, preventing stale data from the previous day bleeding through. Uses a cancellable effect to discard late-resolving reads.</P>

      <H3>OfflineBanner</H3>
      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-sm text-amber-200">Offline — showing cached data</span>
      </div>
      <P>Rendered above the ScrollView on Workout and Session screens when <Code>isOffline</Code> is true. No props — self-contained.</P>

      <H3>Known gaps</H3>
      <Table headers={["Gap", "Status"]} rows={[
        ["Pending set-log queue while offline", "Not implemented — Task #15"],
        ["Cache invalidation on plan switch", "Stale plan may briefly appear — Task #16"],
      ]} />

      <Callout icon={Code2}>
        To add offline support to a new screen: create a <Code>useOffline&lt;Name&gt;</Code> hook following the same pattern, choose a namespaced key <Code>liftiq:&lt;feature&gt;:&lt;id&gt;</Code>, and update this doc.
      </Callout>
    </div>
  );
}

function SectionTheming() {
  const themes = [
    { key: "green (default)", hex: "#22c55e", cls: "bg-[#22c55e]" },
    { key: "blue", hex: "#3b82f6", cls: "bg-[#3b82f6]" },
    { key: "purple", hex: "#a855f7", cls: "bg-[#a855f7]" },
    { key: "orange", hex: "#f97316", cls: "bg-[#f97316]" },
    { key: "red", hex: "#ef4444", cls: "bg-[#ef4444]" },
    { key: "yellow", hex: "#eab308", cls: "bg-[#eab308]" },
  ];

  return (
    <div>
      <p className="text-primary font-mono text-xs tracking-widest mb-2">UI SYSTEM</p>
      <H2>Theming</H2>
      <P>The web app supports six accent colour themes. The chosen theme is persisted in <Code>localStorage</Code> under <Code>liftiq-theme</Code> and applied before first paint to prevent a colour flash.</P>

      <H3>Accent colours</H3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {themes.map(({ key, hex, cls }) => (
          <div key={key} className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-3">
            <div className={`w-6 h-6 rounded-full shrink-0 ${cls}`} />
            <div>
              <div className="font-mono text-xs text-foreground">{key}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{hex}</div>
            </div>
          </div>
        ))}
      </div>

      <H3>How it works</H3>
      <Table headers={["Step", "Where"]} rows={[
        ["User picks a colour in Settings", "settings.tsx → writes key to localStorage"],
        ["Class applied to <html> instantly", "Settings removes old class, adds new one"],
        ["On next page load — blocking script reads localStorage", "index.html inline <script> before paint"],
        ["CSS variables overridden per class", "src/index.css .theme-* classes"],
        ["Components use var(--primary) via Tailwind", "text-primary, bg-primary, etc."],
      ]} />

      <Callout icon={Shield} color="amber">
        The flash-prevention script in <Code>index.html</Code> must be updated in lockstep with the <Code>THEMES</Code> constant in <Code>settings.tsx</Code>. A theme added to Settings but not the script will cause a colour flash on page load.
      </Callout>

      <H3>Adding a new theme</H3>
      <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-2 text-sm">
        {[
          ["1", "Choose a key (e.g. pink) and primary hex colour"],
          ["2", "Add .theme-pink to src/index.css overriding --primary and related vars"],
          ["3", "Add the key to the THEMES constant in settings.tsx"],
          ["4", "Add the same key to the flash-prevention <script> in index.html"],
          ["5", "Update the table above in this doc"],
        ].map(([n, step]) => (
          <div key={n} className="flex gap-3">
            <span className="font-mono text-primary font-bold w-4 shrink-0">{n}.</span>
            <span className="text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>

      <H3>Mobile theming</H3>
      <P>The mobile app uses <Code>useColors()</Code> from <Code>hooks/useColors.ts</Code> which returns a static set of colour tokens. Accent colour switching on mobile is a proposed feature (Task #10).</P>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section definitions
───────────────────────────────────────────── */
const SECTIONS = [
  { id: "overview",  label: "Overview",        icon: BookOpen,    component: SectionOverview },
  { id: "web",       label: "Web App",          icon: Monitor,     component: SectionWebApp },
  { id: "mobile",    label: "Mobile App",       icon: Smartphone,  component: SectionMobileApp },
  { id: "api",       label: "API Reference",    icon: Server,      component: SectionAPI },
  { id: "data",      label: "Data Model",       icon: Database,    component: SectionDataModel },
  { id: "ai",        label: "AI Features",      icon: Sparkles,    component: SectionAI },
  { id: "billing",   label: "Billing",          icon: CreditCard,  component: SectionBilling },
  { id: "offline",   label: "Offline Support",  icon: WifiOff,     component: SectionOffline },
  { id: "theming",   label: "Theming",          icon: Palette,     component: SectionTheming },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

/* ─────────────────────────────────────────────
   Main Docs page
───────────────────────────────────────────── */
export default function Docs() {
  const [active, setActive] = useState<SectionId>("overview");
  const Section = SECTIONS.find(s => s.id === active)!.component;

  return (
    <Layout>
      <div className="flex gap-8 min-h-[80vh]">
        {/* Left nav */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-1 sticky top-8 self-start">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-3">
            Documentation
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
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View source docs
          </a>
        </aside>

        {/* Mobile section picker */}
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
