import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Crown, CheckCircle, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Invalidate subscription status so it refreshes everywhere
    qc.invalidateQueries({ queryKey: ["/api/stripe/status"] });
  }, [qc]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
        <Crown className="w-10 h-10 text-primary" />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-widest uppercase text-foreground">
          Welcome to Pro
        </h1>
        <p className="text-primary font-mono text-sm tracking-widest">PROTOCOL UNLOCKED</p>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mt-2">
          Your 14-day free trial has started. All AI features are unlocked — build your plan, fuel your training, and track everything. No charge until your trial ends.
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {[
          { label: "Generate AI Training Plan", href: "/plan" },
          { label: "Set Up Nutrition Protocol", href: "/diet" },
          { label: "Run AI Check-in", href: "/checkin" },
        ].map(item => (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-card border border-border rounded-xl hover:border-primary/50 transition group"
          >
            <span className="font-mono text-sm font-bold uppercase tracking-wide">{item.label}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
          </button>
        ))}
        <button
          onClick={() => navigate("/")}
          className="w-full px-5 py-3.5 bg-primary text-black font-black uppercase tracking-widest rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}
