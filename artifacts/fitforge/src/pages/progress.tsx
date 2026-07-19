import { useState } from "react";
import { useGetWeightProgress, useListDexaScans, useListExercises } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

export default function Progress() {
  const { data: exercises } = useListExercises();
  const [selectedExercise, setSelectedExercise] = useState<number | undefined>(undefined);

  const { data: weightData, isLoading: loadingWeight } = useGetWeightProgress({ exerciseId: selectedExercise }, { query: { enabled: true, queryKey: ['weight-progress', selectedExercise] }});
  const { data: dexaScans, isLoading: loadingDexa } = useListDexaScans();

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase">Evolution</h1>
          <p className="text-primary font-mono text-sm tracking-widest">BIOMETRIC & PERFORMANCE TRENDS</p>
        </header>

        <div className="space-y-8 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><TrendingUp className="w-32 h-32" /></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3"><TrendingUp className="w-6 h-6 text-primary" /> Performance Trajectory</h2>
            <select
              className="bg-background border border-border rounded-xl px-5 py-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none max-w-[300px] w-full appearance-none shadow-sm"
              value={selectedExercise || ""}
              onChange={(e) => setSelectedExercise(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Movements</option>
              {exercises?.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>

          <div className="h-[400px] w-full relative z-10">
            {loadingWeight ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse font-mono text-primary tracking-widest">CALCULATING VECTOR...</div>
            ) : weightData && weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} stroke="hsl(var(--muted-foreground))" fontSize={12} fontFamily="monospace" tickMargin={15} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} fontFamily="monospace" tickMargin={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'monospace', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="weightLbs" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 8, fill: '#fff', stroke: 'hsl(var(--primary))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-2xl font-mono text-muted-foreground tracking-widest bg-background/50">NO DATA POINTS RECORDED.</div>
            )}
          </div>
        </div>

        <div className="space-y-8 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Activity className="w-32 h-32" /></div>
           
           <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3 relative z-10"><Activity className="w-6 h-6 text-blue-500" /> Body Composition (DEXA)</h2>
           
           <div className="h-[400px] w-full relative z-10">
            {loadingDexa ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse font-mono text-blue-500 tracking-widest">SCANNING...</div>
            ) : dexaScans && dexaScans.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...dexaScans].reverse()} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="scanDate" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} stroke="hsl(var(--muted-foreground))" fontSize={12} fontFamily="monospace" tickMargin={15} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} fontFamily="monospace" domain={['dataMin - 2', 'dataMax + 2']} tickMargin={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} fontFamily="monospace" domain={['dataMin - 5', 'dataMax + 5']} tickMargin={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'monospace', borderRadius: '8px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="bodyFatPercent" name="Body Fat %" stroke="hsl(var(--chart-2))" strokeWidth={3} fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                  <Area yAxisId="right" type="monotone" dataKey="leanMassLbs" name="Lean Mass (Lbs)" stroke="hsl(var(--chart-3))" strokeWidth={3} fill="hsl(var(--chart-3))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-2xl font-mono text-muted-foreground tracking-widest bg-background/50">NO SCANS LOGGED.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
