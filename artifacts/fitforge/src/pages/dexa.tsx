import { useState } from "react";
import { useListDexaScans, useCreateDexaScan } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Plus, Activity, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Dexa() {
  const { data: scans, isLoading } = useListDexaScans();
  const createScan = useCreateDexaScan();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ scanDate: new Date().toISOString().split('T')[0], bodyFatPercent: 15, leanMassLbs: 150 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createScan.mutateAsync({ data: formData });
    queryClient.invalidateQueries({ queryKey: ['/api/dexa'] });
    setShowForm(false);
  };

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tighter uppercase">DEXA Logs</h1>
            <p className="text-primary font-mono text-sm tracking-widest">BODY COMPOSITION SCANS</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
            <Plus className="w-5 h-5" /> Log Scan
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-border/50 pb-4">Input Scan Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Date</label>
                <input type="date" value={formData.scanDate} onChange={e => setFormData({...formData, scanDate: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Body Fat %</label>
                <input type="number" step="0.1" value={formData.bodyFatPercent} onChange={e => setFormData({...formData, bodyFatPercent: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Lean Mass (Lbs)</label>
                <input type="number" step="0.1" value={formData.leanMassLbs} onChange={e => setFormData({...formData, leanMassLbs: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
            </div>
            <div className="flex justify-end pt-4 relative z-10">
              <button type="submit" disabled={createScan.isPending} className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all">
                {createScan.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Data"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {isLoading ? (
             <div className="animate-pulse font-mono text-primary tracking-widest text-center py-10">RETRIEVING DATA...</div>
          ) : scans?.length === 0 ? (
             <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30 font-mono text-muted-foreground tracking-widest">
               NO SCANS ARCHIVED.
             </div>
          ) : scans?.map(scan => (
            <div key={scan.id} className="bg-card border border-border p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-blue-500/30 transition-colors group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <div className="font-extrabold text-2xl tracking-tight">{new Date(scan.scanDate).toLocaleDateString()}</div>
                  <div className="text-xs font-mono text-muted-foreground tracking-widest mt-1">SCAN ID: {scan.id}</div>
                </div>
              </div>
              <div className="flex gap-10">
                <div className="bg-background border border-border p-4 rounded-2xl min-w-[120px]">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Body Fat</div>
                  <div className="text-3xl font-extrabold font-mono text-foreground text-blue-400">{scan.bodyFatPercent}%</div>
                </div>
                <div className="bg-background border border-border p-4 rounded-2xl min-w-[140px]">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Lean Mass</div>
                  <div className="text-3xl font-extrabold font-mono text-foreground text-primary">{scan.leanMassLbs} <span className="text-sm">LBS</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
