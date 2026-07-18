import React from "react";
import { useGetWorkoutDay, useCreateSession, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Play, ArrowLeft, Info, PlayCircle, Dumbbell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function DayDetail() {
  const [, params] = useRoute("/day/:id");
  const dayId = Number(params?.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: day, isLoading } = useGetWorkoutDay(dayId, { query: { enabled: !!dayId, queryKey: ['day', dayId] }});
  const createSession = useCreateSession();

  const handleStartWorkout = async () => {
    try {
      const session = await createSession.mutateAsync({ data: { dayId } });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setLocation(`/workout/${session.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse font-mono tracking-widest">
          ACCESSING DATABANKS...
        </div>
      </Layout>
    );
  }

  if (!day) return <Layout><div className="font-mono text-center py-20 text-muted-foreground uppercase">Protocol not found.</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        <button onClick={() => setLocation("/plan")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Protocol
        </button>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
          <div className="space-y-3">
            <div className="text-primary font-mono text-sm font-bold uppercase tracking-widest bg-primary/10 inline-block px-3 py-1 rounded-full">DAY {day.dayNumber} • {day.focus}</div>
            <h1 className="text-5xl font-extrabold tracking-tighter uppercase">{day.label}</h1>
            {day.notes && <p className="text-muted-foreground max-w-xl text-lg">{day.notes}</p>}
          </div>
          <button
            onClick={handleStartWorkout}
            disabled={createSession.isPending}
            className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] hover:scale-105 transition-all disabled:opacity-50 w-full md:w-auto"
          >
            <Play className="w-6 h-6 fill-current" />
            {createSession.isPending ? "INITIALIZING..." : "START PROTOCOL"}
          </button>
        </header>

        <div className="space-y-12">
          {day.exerciseGroups.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-2xl font-extrabold uppercase tracking-tight flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  {group.groupName}
                </h2>
                {group.pickOne && <span className="text-xs font-mono font-bold bg-secondary text-muted-foreground px-3 py-1.5 rounded-full tracking-widest border border-border">SELECT ONE</span>}
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {group.exercises.map((workoutExercise) => (
                  <div key={workoutExercise.id} className="bg-card border border-border rounded-2xl p-6 space-y-6 relative overflow-hidden hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-2xl leading-tight uppercase tracking-tight">{workoutExercise.exercise.name}</h3>
                        <div className="text-xs text-muted-foreground font-mono uppercase mt-2 tracking-widest bg-background inline-block px-2 py-1 rounded">{workoutExercise.exercise.muscleGroup} • {workoutExercise.exercise.equipment || 'BW'}</div>
                      </div>
                      {workoutExercise.exercise.videoUrl && (
                        <a href={workoutExercise.exercise.videoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <PlayCircle className="w-8 h-8" />
                        </a>
                      )}
                    </div>

                    {workoutExercise.exercise.instructions && (
                      <div className="text-sm text-muted-foreground flex gap-3 items-start bg-secondary/50 p-4 rounded-xl border border-border/50">
                        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                        <span className="leading-relaxed">{workoutExercise.exercise.instructions}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="text-xs font-mono font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Target Prescriptions</div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono tracking-wider">
                        <div className="bg-background py-2 rounded border border-border text-muted-foreground font-bold">SET</div>
                        <div className="bg-background py-2 rounded border border-border text-muted-foreground font-bold">REPS</div>
                        <div className="bg-background py-2 rounded border border-border text-muted-foreground font-bold">LBS</div>
                        <div className="bg-background py-2 rounded border border-border text-muted-foreground font-bold">REST</div>
                        {workoutExercise.prescribedSets.map((set) => (
                          <React.Fragment key={set.id}>
                            <div className="py-2 font-bold bg-card border border-border/50 rounded">{set.setNumber}</div>
                            <div className="py-2 font-bold text-primary bg-card border border-border/50 rounded">{set.targetRepsMin}-{set.targetRepsMax}</div>
                            <div className="py-2 bg-card border border-border/50 rounded">{set.targetWeightLbs || '--'}</div>
                            <div className="py-2 text-muted-foreground bg-card border border-border/50 rounded">{set.restSeconds}s</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
