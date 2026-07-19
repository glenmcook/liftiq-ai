import { useState, useEffect } from "react";
import { useGetProfile, useSaveProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Save, Loader2, Settings2, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme, type ThemeId } from "@/hooks/useTheme";

export default function Settings() {
  const { data: profile, isLoading } = useGetProfile();
  const saveProfile = useSaveProfile();
  const queryClient = useQueryClient();
  const { themeId, setTheme, themes } = useTheme();

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile.mutateAsync({ data: formData });
    queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-primary animate-pulse font-mono tracking-widest">
          ACCESSING SETTINGS...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-20 max-w-3xl">
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
            <Settings2 className="w-10 h-10 text-primary" /> Parameters
          </h1>
          <p className="text-primary font-mono text-sm tracking-widest">SYSTEM CONFIGURATION</p>
        </header>

        {/* ── Theme Picker ── */}
        <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-border/50 pb-4">
            Appearance
          </h2>
          <p className="text-sm text-muted-foreground font-mono tracking-wide -mt-2">
            Choose your color theme. Changes apply instantly.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const isActive = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setTheme(theme.id as ThemeId)}
                  className={`relative group flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left
                    ${isActive
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_var(--tw-shadow-color)] shadow-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-card/80"
                    }`}
                >
                  {/* Mini palette preview */}
                  <div className="flex items-center gap-2">
                    {/* bg swatch */}
                    <div
                      className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
                      style={{ background: theme.bgHex }}
                    />
                    {/* accent swatch */}
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ background: theme.primaryHex }}
                    />
                    {/* mini bar preview */}
                    <div className="flex-1 flex flex-col gap-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: theme.primaryHex, width: "100%" }}
                      />
                      <div
                        className="h-1.5 rounded-full opacity-30"
                        style={{ background: theme.primaryHex, width: "65%" }}
                      />
                      <div
                        className="h-1.5 rounded-full opacity-15"
                        style={{ background: theme.primaryHex, width: "45%" }}
                      />
                    </div>
                  </div>

                  {/* Names */}
                  <div>
                    <div className="font-bold text-sm tracking-tight">{theme.name}</div>
                    <div className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
                      {theme.label}
                    </div>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: theme.primaryHex }}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: themeId === "arctic" ? "#ffffff" : "#050505" }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Profile Form ── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-border/50 pb-4">Biometrics</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Age</label>
                <input type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-5 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Weight (Lbs)</label>
                <input type="number" value={formData.weightLbs || ''} onChange={e => setFormData({...formData, weightLbs: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-5 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-border/50 pb-4">Objectives</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Primary Goal</label>
                <select value={formData.fitnessGoal || ''} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})} className="w-full bg-background border border-border rounded-xl px-5 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                  <option value="lose_fat">Incinerate Fat</option>
                  <option value="build_muscle">Hypertrophy (Build Muscle)</option>
                  <option value="athletic_performance">Athletic Performance</option>
                  <option value="general_fitness">General Conditioning</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Days Per Week</label>
                <input type="number" min="1" max="7" value={formData.daysPerWeek || ''} onChange={e => setFormData({...formData, daysPerWeek: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-5 py-4 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saveProfile.isPending} className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all text-lg">
            {saveProfile.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> SAVE CONFIGURATION</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
