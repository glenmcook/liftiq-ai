import { useState } from "react";
import { useSaveProfile, useGeneratePlan } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ChevronRight, Sparkles, Loader2, Target } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const saveProfile = useSaveProfile();
  const generatePlan = useGeneratePlan();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 30, gender: "male", weightLbs: 180, heightInches: 70,
    fitnessGoal: "build_muscle", experienceLevel: "intermediate",
    currentActivities: "", daysPerWeek: 4
  });

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    try {
      await saveProfile.mutateAsync({ data: formData });
      await generatePlan.mutateAsync();
      setLocation("/plan");
    } catch (e) {
      console.error(e);
    }
  };

  const isPending = saveProfile.isPending || generatePlan.isPending;

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-10 space-y-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 border border-primary/20">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Calibration Sequence</h1>
          <div className="h-1 bg-secondary rounded-full overflow-hidden w-full max-w-xs mx-auto">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="text-xs font-mono text-primary font-bold tracking-widest">PHASE {step} OF 3</div>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-center">Biometrics</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Weight (Lbs)</label>
                  <input type="number" value={formData.weightLbs} onChange={e => setFormData({...formData, weightLbs: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Height (Inches)</label>
                  <input type="number" value={formData.heightInches} onChange={e => setFormData({...formData, heightInches: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-5 rounded-xl font-bold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all mt-4">
                Next Phase <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-center">Objectives & Experience</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Primary Objective</label>
                  <select value={formData.fitnessGoal} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="lose_fat">Incinerate Fat</option>
                    <option value="build_muscle">Hypertrophy (Build Muscle)</option>
                    <option value="athletic_performance">Athletic Performance</option>
                    <option value="general_fitness">General Conditioning</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Combat Experience</label>
                  <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="beginner">Recruit (Beginner)</option>
                    <option value="intermediate">Operative (Intermediate)</option>
                    <option value="advanced">Veteran (Advanced)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-5 rounded-xl font-bold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all mt-4">
                Next Phase <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-center">Protocol Parameters</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Days Per Week (1-7)</label>
                  <input type="number" min="1" max="7" value={formData.daysPerWeek} onChange={e => setFormData({...formData, daysPerWeek: Math.min(7, Math.max(1, Number(e.target.value)))})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-2xl text-center focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Other Activities (Optional)</label>
                  <textarea placeholder="e.g. running, swimming, jiu-jitsu" value={formData.currentActivities} onChange={e => setFormData({...formData, currentActivities: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] transition-all resize-none" />
                </div>
              </div>
              <button disabled={isPending} onClick={handleSubmit} className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-5 rounded-xl font-bold tracking-widest uppercase hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 mt-4">
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                {isPending ? "Generating Protocol..." : "Generate Protocol"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
