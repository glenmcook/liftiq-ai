import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import {
  Utensils, Loader2, RefreshCw, Settings2, X, ChevronDown, ChevronUp,
  Zap, Beef, Wheat, Droplets, Lightbulb, Clock
} from "lucide-react";
import { customFetch } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;

type Macros = { calories: number; proteinG: number; carbsG: number; fatG: number; goal: string };
type MealItem = { meal: string; time: string; foods: string[]; macros: Macros; notes?: string };
type Recommendations = {
  macros: Macros;
  mealPlan: MealItem[];
  tips: string[];
  dietaryPreference: string;
  allergies: string;
};
type Prefs = { dietaryPreference: string; allergies: string | null; calorieOverride: number | null };

const DIET_OPTIONS = ["omnivore", "vegetarian", "vegan", "pescatarian", "keto", "paleo"];

function MacroRing({ label, value, unit, color, icon: Icon }: {
  label: string; value: number; unit: string; color: string; icon: any;
}) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 ${color}`} />
      <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-bold ${color.replace("bg-", "text-")}`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-3xl font-black font-mono text-foreground">
        {value}<span className="text-sm font-mono text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}

function MacroBar({ proteinG, carbsG, fatG }: { proteinG: number; carbsG: number; fatG: number }) {
  const total = proteinG * 4 + carbsG * 4 + fatG * 9;
  const pPct = Math.round((proteinG * 4 / total) * 100);
  const cPct = Math.round((carbsG * 4 / total) * 100);
  const fPct = 100 - pPct - cPct;
  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-3 w-full">
        <div className="bg-blue-500 transition-all" style={{ width: `${pPct}%` }} title={`Protein ${pPct}%`} />
        <div className="bg-primary transition-all" style={{ width: `${cPct}%` }} title={`Carbs ${cPct}%`} />
        <div className="bg-orange-400 transition-all" style={{ width: `${fPct}%` }} title={`Fat ${fPct}%`} />
      </div>
      <div className="flex gap-4 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Protein {pPct}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Carbs {cPct}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Fat {fPct}%</span>
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: MealItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground uppercase tracking-wide text-sm">{meal.meal}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
              <Clock className="w-3 h-3" /> {meal.time}
              <span className="mx-2">·</span>
              <span className="text-primary font-bold">{meal.macros?.calories ?? "—"} kcal</span>
              <span className="mx-1">·</span>
              <span>{meal.macros?.proteinG ?? "—"}g P</span>
              <span className="mx-1">·</span>
              <span>{meal.macros?.carbsG ?? "—"}g C</span>
              <span className="mx-1">·</span>
              <span>{meal.macros?.fatG ?? "—"}g F</span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
          <ul className="space-y-1.5">
            {meal.foods.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">▸</span> {f}
              </li>
            ))}
          </ul>
          {meal.notes && (
            <p className="text-xs text-muted-foreground font-mono italic border-l-2 border-primary/30 pl-3">{meal.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Diet() {
  const qc = useQueryClient();
  const [showPrefs, setShowPrefs] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Partial<Prefs>>({});

  const { data: prefs } = useQuery<Prefs>({
    queryKey: ["/api/diet/preferences"],
    queryFn: () => customFetch<Prefs>(`${BASE}api/diet/preferences`),
  });

  const [forceRefresh, setForceRefresh] = useState(false);
  const { data: recs, isLoading, isFetching, refetch } = useQuery<Recommendations>({
    queryKey: ["/api/diet/recommendations"],
    queryFn: () => customFetch<Recommendations>(`${BASE}api/diet/recommendations${forceRefresh ? "?refresh=true" : ""}`),
    staleTime: Infinity,
  });

  const handleRegenerate = () => {
    setForceRefresh(true);
    setTimeout(() => refetch().finally(() => setForceRefresh(false)), 0);
  };

  const savePrefs = useMutation({
    mutationFn: (data: Partial<Prefs>) =>
      customFetch(`${BASE}api/diet/preferences`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/diet/preferences"] });
      qc.invalidateQueries({ queryKey: ["/api/diet/recommendations"] });
      setShowPrefs(false);
    },
  });

  const openPrefs = () => {
    setLocalPrefs({
      dietaryPreference: prefs?.dietaryPreference ?? "omnivore",
      allergies: prefs?.allergies ?? null,
      calorieOverride: prefs?.calorieOverride ?? null,
    });
    setShowPrefs(true);
  };

  const macros = recs?.macros;

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-widest uppercase">Nutrition</h1>
            <p className="text-primary font-mono text-sm tracking-widest">FUEL PROTOCOL</p>
          </div>
          <div className="flex gap-3">
            <button onClick={openPrefs} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-mono text-xs font-bold uppercase tracking-widest">
              <Settings2 className="w-4 h-4" /> Preferences
            </button>
            <button onClick={handleRegenerate} disabled={isFetching} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all font-mono text-xs font-bold uppercase tracking-widest">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} /> Regenerate
            </button>
          </div>
        </header>

        {/* Preferences panel */}
        {showPrefs && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="font-bold uppercase tracking-widest text-sm">Dietary Preferences</h2>
              <button onClick={() => setShowPrefs(false)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Diet Type</label>
                <select
                  value={localPrefs.dietaryPreference ?? "omnivore"}
                  onChange={e => setLocalPrefs(p => ({ ...p, dietaryPreference: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary outline-none"
                >
                  {DIET_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Allergies / Restrictions</label>
                <input
                  type="text"
                  placeholder="e.g. dairy, gluten, nuts"
                  value={localPrefs.allergies ?? ""}
                  onChange={e => setLocalPrefs(p => ({ ...p, allergies: e.target.value || null }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Calorie Override (optional)</label>
                <input
                  type="number"
                  placeholder="Auto-calculated"
                  value={localPrefs.calorieOverride ?? ""}
                  onChange={e => setLocalPrefs(p => ({ ...p, calorieOverride: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPrefs(false)} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground font-mono text-xs font-bold uppercase tracking-widest">Cancel</button>
              <button
                onClick={() => savePrefs.mutate(localPrefs)}
                disabled={savePrefs.isPending}
                className="px-6 py-2.5 bg-primary text-black font-bold uppercase tracking-widest rounded-xl text-xs flex items-center gap-2"
              >
                {savePrefs.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save & Recalculate"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary font-mono tracking-widest animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm">AI IS BUILDING YOUR FUEL PROTOCOL...</span>
          </div>
        )}

        {recs && macros && (
          <>
            {/* Macro targets */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold uppercase tracking-widest">Daily Targets</h2>
                <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded capitalize">{recs.dietaryPreference}</span>
                {recs.allergies && recs.allergies !== "none" && (
                  <span className="text-xs font-mono text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded">⚠ {recs.allergies}</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MacroRing label="Calories" value={macros.calories} unit="kcal" color="bg-white" icon={Zap} />
                <MacroRing label="Protein"  value={macros.proteinG} unit="g"    color="bg-blue-500"   icon={Beef} />
                <MacroRing label="Carbs"    value={macros.carbsG}   unit="g"    color="bg-primary"    icon={Wheat} />
                <MacroRing label="Fat"      value={macros.fatG}     unit="g"    color="bg-orange-400" icon={Droplets} />
              </div>

              <MacroBar proteinG={macros.proteinG} carbsG={macros.carbsG} fatG={macros.fatG} />
            </section>

            {/* Meal plan */}
            {recs.mealPlan?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold uppercase tracking-widest">Daily Meal Plan</h2>
                <div className="space-y-3">
                  {recs.mealPlan.map((meal, i) => <MealCard key={i} meal={meal} />)}
                </div>
              </section>
            )}

            {/* Tips */}
            {recs.tips?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold uppercase tracking-widest">Nutrition Tips</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {recs.tips.map((tip, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
                      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
