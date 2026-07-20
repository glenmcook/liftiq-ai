import { useState, useMemo } from "react";
import { useListExercises } from "@workspace/api-client-react";
import { Search, X, Dumbbell, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwapExerciseModalProps {
  currentExerciseId: number;
  muscleGroup: string;
  onSelect: (exercise: any) => void;
  onClose: () => void;
}

export function SwapExerciseModal({ currentExerciseId, muscleGroup, onSelect, onClose }: SwapExerciseModalProps) {
  const [search, setSearch] = useState("");

  const { data: allExercises = [], isLoading } = useListExercises(
    {},
    { query: { queryKey: ["exercises"] } }
  );

  const alternates = useMemo(() => {
    return allExercises.filter((ex) => {
      if (ex.id === currentExerciseId) return false;
      if (ex.muscleGroup !== muscleGroup) return false;
      if (!search.trim()) return true;
      return (
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.equipment ?? "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [allExercises, currentExerciseId, muscleGroup, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-6 duration-300 max-h-[80dvh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-bold mb-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Machine Busy
            </div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              Swap Exercise
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-widest">
              {muscleGroup} · session only
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest animate-pulse">
              Loading alternatives...
            </div>
          ) : alternates.length === 0 ? (
            <div className="py-12 text-center">
              <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">No alternates found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alternates.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full text-left px-5 py-4 hover:bg-primary/5 hover:border-l-2 hover:border-primary transition-all group flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-bold uppercase tracking-tight text-sm group-hover:text-primary transition-colors truncate">
                      {ex.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {ex.equipment && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded uppercase tracking-widest">
                          {ex.equipment}
                        </span>
                      )}
                      {ex.category && (
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {ex.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <p className="text-[11px] font-mono text-muted-foreground text-center">
            Swap applies to this session only — your program resets next time.
          </p>
        </div>
      </div>
    </div>
  );
}
