import React, { useEffect } from "react";
import { X, PlayCircle, ExternalLink, BookOpen, Dumbbell } from "lucide-react";

interface Exercise {
  id?: number;
  name: string;
  muscleGroup: string;
  category?: string;
  equipment?: string;
  videoUrl?: string | null;
  description?: string | null;
  instructions?: string | null;
}

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

function getEmbedUrl(url: string): string | null {
  // Handle youtube.com/embed/... already
  if (url.includes("youtube.com/embed/")) return url;
  // Handle youtube.com/watch?v=
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // Handle youtu.be/
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return null;
}

function getWatchUrl(url: string): string {
  const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  return url;
}

function getYouTubeSearchUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to ${name} proper form tutorial`)}`;
}

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  useEffect(() => {
    if (!exercise) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [exercise, onClose]);

  if (!exercise) return null;

  const embedUrl = exercise.videoUrl ? getEmbedUrl(exercise.videoUrl) : null;
  const watchUrl = exercise.videoUrl ? getWatchUrl(exercise.videoUrl) : getYouTubeSearchUrl(exercise.name);
  const hasRealVideo = !!embedUrl;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[92dvh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-5 md:p-6 flex items-start justify-between gap-4 z-10">
          <div className="space-y-1.5 min-w-0">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter leading-tight">
              {exercise.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                {exercise.muscleGroup}
              </span>
              {exercise.category && (
                <span className="text-xs font-mono bg-secondary text-muted-foreground px-3 py-1 rounded-full uppercase tracking-widest">
                  {exercise.category}
                </span>
              )}
              {exercise.equipment && (
                <span className="text-xs font-mono bg-secondary text-muted-foreground px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {exercise.equipment}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Video section */}
          <div className="space-y-3">
            {hasRealVideo ? (
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Tutorial Video
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-[0_0_30px_rgba(57,255,20,0.1)] border border-border">
                  <iframe
                    src={`${embedUrl}?rel=0&modestbranding=1`}
                    title={`How to: ${exercise.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary font-mono tracking-widest transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Open on YouTube
                </a>
              </div>
            ) : (
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-secondary hover:bg-primary/10 hover:border-primary/40 border border-border rounded-xl py-6 text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group"
              >
                <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Find Tutorial on YouTube
                <ExternalLink className="w-4 h-4 opacity-60" />
              </a>
            )}
          </div>

          {/* Description */}
          {exercise.description && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-primary uppercase tracking-widest">About This Exercise</div>
              <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Execution Cues
              </div>
              <div className="bg-secondary/50 border border-border rounded-xl p-5">
                <p className="text-sm text-foreground leading-relaxed">{exercise.instructions}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
