import { useListSessions } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { History, Calendar, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function SessionHistory() {
  const { data: sessions, isLoading } = useListSessions();

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase">Combat Log</h1>
          <p className="text-primary font-mono text-sm tracking-widest">ARCHIVED SESSION DATA</p>
        </header>

        {isLoading ? (
           <div className="animate-pulse font-mono text-muted-foreground tracking-widest">ACCESSING ARCHIVES...</div>
        ) : sessions?.length === 0 ? (
           <div className="text-center py-24 border border-dashed border-border rounded-3xl bg-card/30">
             <History className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
             <h2 className="text-2xl font-bold uppercase mb-3 tracking-tight">No Records Found</h2>
             <p className="text-muted-foreground font-mono tracking-widest">Your journey starts today. Hit the gym.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {sessions?.map(session => (
              <div key={session.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{session.dayLabel}</h3>
                    <div className="flex items-center gap-6 mt-3 text-xs font-mono text-muted-foreground tracking-widest">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(session.startedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-2 py-1 rounded"><CheckCircle className="w-4 h-4" /> {session.completedSets} / {session.totalSets} SETS</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Status</div>
                     <div className="font-bold font-mono text-sm mt-1">{session.completedAt ? "COMPLETED" : "INCOMPLETE"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
