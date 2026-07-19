import { useGetActivePlan, useGeneratePlan, getGetActivePlanQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ArrowRight, Activity, Clock, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Plan() {
  const { data: plan, isLoading } = useGetActivePlan();
  const generatePlan = useGeneratePlan();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const handleRegenerate = async () => {
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    await generatePlan.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getGetActivePlanQueryKey() });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse font-mono tracking-widest">
          DECRYPTING PROTOCOL...
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter">No Active Protocol</h1>
          <p className="text-muted-foreground text-lg max-w-md">Your systems are dormant. Calibrate your profile to generate a training vector.</p>
          <Link href="/onboarding" className="mt-4 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
            Calibrate Now
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <header className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-mono font-bold uppercase tracking-widest">
              <Activity className="w-4 h-4" /> Active Protocol
            </div>
            <div className="flex items-center gap-3">
              {confirming && (
                <span className="text-xs font-mono text-muted-foreground">
                  This will replace your current plan.
                </span>
              )}
              <button
                onClick={handleRegenerate}
                disabled={generatePlan.isPending}
                onBlur={() => setConfirming(false)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest border transition-all ${
                  confirming
                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {generatePlan.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> {confirming ? "Confirm Regenerate" : "Regenerate Plan"}</>
                }
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-snug">{plan.name}</h1>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">{plan.description}</p>
          {plan.aiNotes && (
            <div className="bg-card/50 border border-primary/30 p-6 rounded-2xl font-mono text-sm text-foreground italic border-l-4 border-l-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-primary/20"><Activity className="w-16 h-16" /></div>
              <div className="relative z-10">" {plan.aiNotes} " <br/><span className="text-primary mt-2 inline-block font-bold not-italic">— AI COACH</span></div>
            </div>
          )}
        </header>

        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight flex items-center gap-2">
            Training Days <span className="text-muted-foreground font-mono text-sm ml-2 font-normal tracking-widest">{plan.days.length} PHASES</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plan.days.map((day) => (
              <Link key={day.id} href={`/day/${day.id}`} className="group relative bg-card border border-border p-8 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
                <div className="space-y-2 relative z-10">
                  <div className="text-primary font-mono text-sm font-bold tracking-widest">DAY {day.dayNumber}</div>
                  <h3 className="text-3xl font-extrabold tracking-tighter uppercase">{day.label}</h3>
                  <div className="inline-block bg-secondary text-muted-foreground font-mono text-xs uppercase px-2 py-1 rounded tracking-widest mt-2">{day.focus}</div>
                </div>
                <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground font-mono relative z-10 border-t border-border/50 pt-4 group-hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {Math.floor(day.restSeconds / 60)}m Rest</div>
                  <div className="text-primary group-hover:translate-x-2 transition-transform"><ArrowRight className="w-6 h-6" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
