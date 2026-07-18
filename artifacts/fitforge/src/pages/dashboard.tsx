import { useGetDashboardSummary, useGetProfile } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Flame, Trophy, Calendar, Zap, ArrowRight, Activity, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: profile, isLoading: isLoadingProfile } = useGetProfile();

  if (isLoadingSummary || isLoadingProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-primary animate-pulse font-mono flex-col gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          CALIBRATING SENSORS...
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
            <Flame className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase">Initiate Sequence</h1>
          <p className="text-muted-foreground max-w-md text-lg">Your profile is uncalibrated. Configure your parameters to generate your training protocol.</p>
          <Link href="/onboarding" className="mt-4 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold tracking-wide uppercase hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all">
            Configure Profile
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-0">
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase">Command Center</h1>
          <p className="text-primary font-mono text-sm tracking-widest">STATUS: OPTIMAL • {new Date().toLocaleDateString()}</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-primary" /> Current Streak</div>
            <div className="text-4xl font-mono text-foreground font-bold">{summary?.currentStreak || 0} <span className="text-sm text-muted-foreground">DAYS</span></div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> This Week</div>
            <div className="text-4xl font-mono text-foreground font-bold">{summary?.sessionsThisWeek || 0} <span className="text-sm text-muted-foreground">SESSIONS</span></div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> PRs Hit</div>
            <div className="text-4xl font-mono text-foreground font-bold">{summary?.personalRecords || 0} <span className="text-sm text-muted-foreground">TOTAL</span></div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Body Fat</div>
            <div className="text-4xl font-mono text-foreground font-bold">{summary?.latestBodyFat ? `${summary.latestBodyFat}%` : '--'}</div>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_0_40px_rgba(57,255,20,0.05)]">
          <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
            <Zap className="w-80 h-80 text-primary" />
          </div>
          <div className="z-10 text-center md:text-left space-y-2">
            <h2 className="text-xl font-bold tracking-widest text-primary uppercase font-mono">Next Objective</h2>
            {summary?.nextWorkoutDay ? (
              <div className="text-3xl font-extrabold uppercase">{summary.nextWorkoutDay.label} <span className="text-muted-foreground font-normal">({summary.nextWorkoutDay.focus})</span></div>
            ) : (
              <div className="text-3xl font-extrabold text-muted-foreground uppercase">No active protocol</div>
            )}
          </div>
          <div className="z-10 w-full md:w-auto">
            {summary?.nextWorkoutDay ? (
              <Link href={`/day/${summary.nextWorkoutDay.id}`} className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] hover:scale-105 transition-all">
                Initiate Protocol <ArrowRight className="w-6 h-6" />
              </Link>
            ) : (
              <Link href="/plan" className="w-full md:w-auto flex items-center justify-center gap-2 bg-secondary text-foreground border border-border px-10 py-5 rounded-xl font-bold tracking-widest uppercase hover:bg-muted transition-all">
                View Plan
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">Recent Protocols</h2>
          {summary?.recentSessions && summary.recentSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.recentSessions.map(session => (
                <Link key={session.id} href={`/history`} className="block bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-bold text-xl uppercase tracking-tight group-hover:text-primary transition-colors">{session.dayLabel}</div>
                    <div className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">{new Date(session.startedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-mono tracking-wider">
                    <span className="text-primary font-bold">{session.completedSets} / {session.totalSets} SETS</span>
                    <span className="text-muted-foreground">{session.completedAt ? "COMPLETED" : "IN PROGRESS"}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground font-mono tracking-widest bg-card/50">
              NO LOG DATA DETECTED. COMMENCE TRAINING.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
