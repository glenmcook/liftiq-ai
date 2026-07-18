import { useState, useEffect } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

export function Timer({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <div className="h-full bg-primary transition-all ease-linear" style={{ width: `${(timeLeft / seconds) * 100}%` }} />
      </div>
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Recovery Protocol</div>
      <div className="text-7xl font-mono font-bold text-primary tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isRunning ? "PAUSE" : "RESUME"}
        </button>
        <button
          onClick={() => { setTimeLeft(seconds); setIsRunning(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-muted-foreground border border-border rounded-full font-bold uppercase tracking-wide hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </button>
      </div>
    </div>
  );
}
