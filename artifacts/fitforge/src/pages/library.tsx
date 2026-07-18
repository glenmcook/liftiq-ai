import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useListExercises } from "@workspace/api-client-react";
import { ExerciseModal } from "@/components/exercise-modal";
import { Search, PlayCircle, Dumbbell, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = ["all", "chest", "shoulders", "back", "biceps", "triceps", "legs", "calves", "core"];
const MUSCLE_COLORS: Record<string, string> = {
  chest: "text-red-400 bg-red-400/10",
  shoulders: "text-orange-400 bg-orange-400/10",
  back: "text-blue-400 bg-blue-400/10",
  biceps: "text-purple-400 bg-purple-400/10",
  triceps: "text-pink-400 bg-pink-400/10",
  legs: "text-yellow-400 bg-yellow-400/10",
  calves: "text-amber-400 bg-amber-400/10",
  core: "text-cyan-400 bg-cyan-400/10",
};

export default function Library() {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const { data: exercises = [], isLoading } = useListExercises(
    {},
    { query: { queryKey: ["exercises"] } }
  );

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
        (ex.equipment || "").toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscleFilter === "all" || ex.muscleGroup === muscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, muscleFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const ex of filtered) {
      const key = ex.muscleGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    }
    return groups;
  }, [filtered]);

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <header className="space-y-3">
          <div className="text-primary font-mono text-sm font-bold uppercase tracking-widest bg-primary/10 inline-block px-3 py-1 rounded-full">
            Exercise Glossary
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase">
            Library
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Every exercise in your program — with technique cues and video tutorials. Tap any card to watch how it's done.
          </p>
        </header>

        {/* Search + Filter */}
        <div className="space-y-4 sticky top-0 md:top-4 z-20 bg-background/95 backdrop-blur py-3 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises, muscles, or equipment..."
              className="w-full pl-11 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 self-center" />
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setMuscleFilter(g)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-all border",
                  muscleFilter === g
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-muted-foreground font-mono uppercase tracking-widest animate-pulse">
            Loading Databank...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-mono uppercase tracking-widest">
            No exercises found.
          </div>
        )}

        {/* Exercise groups */}
        {!isLoading && Object.entries(grouped).map(([muscle, exList]) => (
          <div key={muscle} className="space-y-4">
            <h2 className={cn(
              "text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-2",
              MUSCLE_COLORS[muscle] || "text-muted-foreground bg-secondary"
            )}>
              <Dumbbell className="w-3.5 h-3.5" />
              {muscle} — {exList.length} exercise{exList.length !== 1 ? "s" : ""}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exList.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="text-left bg-card border border-border rounded-2xl p-5 space-y-3 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.07)] transition-all group relative overflow-hidden"
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors rounded-2xl" />

                  <div className="flex items-start justify-between gap-2 relative">
                    <h3 className="font-extrabold uppercase tracking-tight text-lg leading-tight group-hover:text-primary transition-colors">
                      {ex.name}
                    </h3>
                    {ex.videoUrl ? (
                      <PlayCircle className="w-5 h-5 text-primary shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 relative">
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                      MUSCLE_COLORS[ex.muscleGroup] || "text-muted-foreground bg-secondary"
                    )}>
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-widest">
                      {ex.category}
                    </span>
                    {ex.equipment && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-widest">
                        {ex.equipment}
                      </span>
                    )}
                  </div>

                  {ex.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 relative">
                      {ex.description}
                    </p>
                  )}

                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors relative flex items-center gap-1">
                    {ex.videoUrl ? (
                      <><PlayCircle className="w-3 h-3" /> Tap to watch tutorial</>
                    ) : (
                      <><Search className="w-3 h-3" /> Tap for technique cues</>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </Layout>
  );
}
