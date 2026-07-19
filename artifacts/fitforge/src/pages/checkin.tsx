import { useState } from "react";
import { useListCheckins, useCreateCheckin } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Checkin() {
  const { data: checkins, isLoading } = useListCheckins();
  const createCheckin = useCreateCheckin();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCheckin.mutateAsync({ data: { userNotes: notes, feelingScore: feeling } });
    setNotes("");
    setFeeling(7);
    queryClient.invalidateQueries({ queryKey: ['/api/checkins'] });
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-widest uppercase">AI Check-in</h1>
          <p className="text-primary font-mono text-sm tracking-widest">SYSTEM FEEDBACK & ADJUSTMENTS</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
            <Sparkles className="w-96 h-96" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div>
                <label className="font-extrabold uppercase tracking-tight flex justify-between text-xl">
                  <span>Readiness Score</span>
                  <span className="font-mono text-primary bg-primary/10 px-3 py-1 rounded-lg">{feeling} / 10</span>
                </label>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  How ready does your body feel to train today? Consider your sleep quality, muscle soreness, stress levels, and overall energy. A <span className="text-foreground font-medium">1–3</span> means you're beat up and need recovery. <span className="text-foreground font-medium">4–6</span> is average — you can train but won't set records. <span className="text-foreground font-medium">7–10</span> means you're fresh and primed to push hard. Be honest — the AI uses this to decide whether to recommend adjusting your program.
                </p>
              </div>
              <input type="range" min="1" max="10" value={feeling} onChange={e => setFeeling(Number(e.target.value))} className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-xs font-mono text-muted-foreground tracking-widest font-bold">
                <span>DEPLETED</span>
                <span>OPTIMAL</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-extrabold uppercase tracking-tight text-xl">Status Report</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Report any soreness, fatigue, or performance notes for the AI to analyze..." className="w-full bg-background border border-border rounded-2xl px-5 py-4 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[150px] resize-none transition-all" required />
            </div>

            <button type="submit" disabled={createCheckin.isPending} className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] disabled:opacity-50 transition-all text-lg">
              {createCheckin.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> TRANSMIT DATA</>}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">Transmission History</h2>
          {isLoading ? (
            <div className="animate-pulse font-mono text-primary tracking-widest">ACCESSING ARCHIVES...</div>
          ) : checkins?.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30 font-mono text-muted-foreground tracking-widest">
               NO COMMUNICATIONS LOGGED.
            </div>
          ) : checkins?.map(checkin => (
            <div key={checkin.id} className="bg-card border border-border p-8 rounded-3xl space-y-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <div className="font-mono text-sm text-muted-foreground tracking-widest bg-secondary px-3 py-1 rounded">{new Date(checkin.checkinDate).toLocaleDateString()}</div>
                <div className="font-mono font-bold text-primary tracking-widest">SCORE: {checkin.feelingScore}/10</div>
              </div>
              
              {checkin.userNotes && (
                <div className="text-sm bg-background border border-border p-5 rounded-2xl">
                  <span className="font-mono text-muted-foreground uppercase text-[10px] tracking-widest block mb-2 font-bold">YOUR REPORT:</span>
                  <p className="leading-relaxed">{checkin.userNotes}</p>
                </div>
              )}
              
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                <span className="font-mono text-primary uppercase text-[10px] tracking-widest font-bold block mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI ANALYSIS:</span>
                <div className="text-sm leading-relaxed text-foreground/90">{checkin.aiResponse}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
