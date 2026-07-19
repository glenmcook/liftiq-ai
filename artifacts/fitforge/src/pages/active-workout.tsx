import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetSession, useLogSet, useUpdateSession, getGetSessionQueryKey, getGetDashboardSummaryQueryKey, useGetWorkoutDay } from "@workspace/api-client-react";
import { Timer } from "@/components/timer";
import { ExerciseModal } from "@/components/exercise-modal";
import { Check, ArrowRight, ArrowLeft, Loader2, Trophy, PlayCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

function SetRow({ prescribedSet, exercise, session, sessionId, onSetCompleted, logSet }: any) {
  const logged = session?.loggedSets?.find((s: any) => s.exerciseId === exercise.exerciseId && s.setNumber === prescribedSet.setNumber);
  const [reps, setReps] = useState(logged?.actualReps || prescribedSet.targetRepsMax);
  const [weight, setWeight] = useState(logged?.actualWeightLbs || prescribedSet.targetWeightLbs || 0);
  const queryClient = useQueryClient();

  const handleLog = async () => {
    if (logged) return;
    await logSet.mutateAsync(
      { sessionId, data: { exerciseId: exercise.exerciseId, setNumber: prescribedSet.setNumber, actualReps: reps, actualWeightLbs: weight } },
      {
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(session.id) });
           if (prescribedSet.restSeconds > 0) {
             onSetCompleted(prescribedSet.restSeconds);
           }
         }
      }
    );
  };

  return (
    <div className={cn("grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 items-center p-5 rounded-2xl border transition-all duration-300", logged ? "bg-primary/10 border-primary/50 shadow-[inset_0_0_20px_rgba(57,255,20,0.05)]" : "bg-card border-border")}>
      <div className="font-mono text-muted-foreground font-bold text-sm tracking-widest">SET {prescribedSet.setNumber}</div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-20 bg-background border border-border rounded-lg text-foreground font-mono font-bold text-center py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" disabled={!!logged} />
          <span className="text-xs text-muted-foreground font-mono tracking-widest ml-1">LBS</span>
        </div>
        {prescribedSet.targetWeightLbs && <div className="text-[10px] text-muted-foreground font-mono mt-2 tracking-widest bg-secondary px-2 py-0.5 rounded">TARGET: {prescribedSet.targetWeightLbs}</div>}
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="w-20 bg-background border border-border rounded-lg text-foreground font-mono font-bold text-center py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" disabled={!!logged} />
          <span className="text-xs text-muted-foreground font-mono tracking-widest ml-1">REPS</span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mt-2 tracking-widest bg-secondary px-2 py-0.5 rounded">TARGET: {prescribedSet.targetRepsMin}-{prescribedSet.targetRepsMax}</div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleLog} disabled={!!logged || logSet.isPending} className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300", logged ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(57,255,20,0.5)] scale-110" : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary hover:scale-105")}>
          {logSet.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-7 h-7" />}
        </button>
      </div>
      {logged?.isPersonalRecord && (
        <div className="col-span-4 mt-3 flex items-center justify-center gap-2 text-xs font-mono font-bold text-background bg-primary py-2 rounded-lg tracking-widest">
          <Trophy className="w-4 h-4" /> PERSONAL RECORD
        </div>
      )}
    </div>
  );
}

export default function ActiveWorkout() {
  const [, params] = useRoute("/workout/:id");
  const sessionId = Number(params?.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: session, isLoading: loadingSession } = useGetSession(sessionId, { query: { enabled: !!sessionId, queryKey: ['session', sessionId] }});
  const { data: day, isLoading: loadingDay } = useGetWorkoutDay(session?.dayId || 0, { query: { enabled: !!session?.dayId, queryKey: ['day', session?.dayId] }});

  const logSet = useLogSet();
  const updateSession = useUpdateSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [howToExercise, setHowToExercise] = useState<any>(null);

  if (loadingSession || loadingDay) {
     return <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono animate-pulse tracking-widest text-xl"><Loader2 className="w-8 h-8 animate-spin mr-3"/> LOADING COMBAT DATA...</div>;
  }

  if (!session || !day) return <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center font-mono uppercase tracking-widest">Error loading session</div>;

  const allExercises = day.exerciseGroups.flatMap(g => g.exercises);
  const exercise = allExercises[currentIndex];

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 space-y-8 border-x border-border/30 max-w-2xl mx-auto shadow-2xl">
        <Trophy className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(57,255,20,0.5)]" />
        <h1 className="text-5xl font-extrabold uppercase tracking-tighter text-center">PROTOCOL COMPLETE</h1>
        <p className="text-muted-foreground font-mono text-center text-lg max-w-md">All prescribed sets have been executed. Your evolution is logged.</p>
        <button
           onClick={async () => {
             await updateSession.mutateAsync({ sessionId, data: { completedAt: new Date().toISOString() } });
             queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
             setLocation("/");
           }}
           className="bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:shadow-[0_0_50px_rgba(57,255,20,0.6)] hover:scale-105 transition-all w-full md:w-auto mt-8"
        >
           FINISH & RETURN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col max-w-2xl mx-auto border-x border-border shadow-2xl relative">
      <header className="p-4 md:p-6 border-b border-border bg-card/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
        <button onClick={() => setLocation(`/day/${session.dayId}`)} className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase bg-primary/10 inline-block px-2 py-0.5 rounded-full mb-1">{day.label}</div>
          <div className="font-bold font-mono tracking-widest text-sm">EXERCISE {currentIndex + 1} OF {allExercises.length}</div>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-10 overflow-y-auto pb-40">
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-extrabold uppercase tracking-tighter leading-tight">{exercise.exercise.name}</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="text-muted-foreground font-mono text-xs uppercase tracking-widest bg-secondary inline-block px-3 py-1 rounded">{exercise.exercise.muscleGroup}</div>
            <button
              onClick={() => setHowToExercise(exercise.exercise)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded transition-colors border border-primary/30 hover:border-primary/60"
            >
              <PlayCircle className="w-3.5 h-3.5" /> How To
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {exercise.prescribedSets.map((set) => (
            <SetRow
              key={set.id}
              prescribedSet={set}
              exercise={exercise}
              session={session}
              sessionId={sessionId}
              logSet={logSet}
              onSetCompleted={(secs: number) => setRestSeconds(secs)}
            />
          ))}
        </div>

        {restSeconds !== null && (
          <div className="my-10 animate-in slide-in-from-top-4 fade-in duration-500">
            <Timer seconds={restSeconds} />
          </div>
        )}
      </main>

      <footer className="p-4 md:p-6 border-t border-border bg-card/95 backdrop-blur fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex items-center justify-between z-30 border-x">
         <button
           onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
           disabled={currentIndex === 0}
           className="text-muted-foreground font-mono text-xs uppercase tracking-widest disabled:opacity-30 p-2 hover:bg-secondary rounded transition-colors"
         >
           PREV EXERCISE
         </button>
         <button
           onClick={() => {
             setRestSeconds(null);
             setCurrentIndex(c => c + 1);
             window.scrollTo(0, 0);
           }}
           className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
         >
           NEXT <ArrowRight className="w-5 h-5" />
         </button>
      </footer>

      <ExerciseModal exercise={howToExercise} onClose={() => setHowToExercise(null)} />
    </div>
  );
}
