import { Link, useLocation } from "wouter";
import { Dumbbell, Home, LineChart, History, Activity, Sparkles, Settings, Star, BookOpen, Utensils, Crown } from "lucide-react";
import { LiftIQMark } from "./liftiq-logo";
import { useQuery } from "@tanstack/react-query";
import { TrialBanner } from "./trial-banner";

const BASE = import.meta.env.BASE_URL;

function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className={`flex items-center gap-2.5 ${size === "sm" ? "gap-2" : ""}`}>
      <LiftIQMark className={`text-primary shrink-0 ${size === "sm" ? "w-7 h-7" : "w-9 h-9"}`} />
      <span className={`font-black tracking-widest uppercase ${size === "sm" ? "text-lg" : "text-xl"}`}>
        <span className="text-foreground">LIFT</span><span className="text-primary">IQ AI</span>
      </span>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const { data: subStatus } = useQuery<{ isActive: boolean }>({
    queryKey: ["/api/stripe/status"],
    queryFn: () => fetch(`${BASE}api/stripe/status`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const isPro = subStatus?.isActive ?? false;

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/plan", label: "Protocol", icon: Dumbbell },
    { href: "/history", label: "History", icon: History },
    { href: "/progress", label: "Progress", icon: LineChart },
    { href: "/dexa", label: "DEXA Scans", icon: Activity },
    { href: "/checkin", label: "AI Check-in", icon: Sparkles },
    { href: "/diet", label: "Diet", icon: Utensils },
    { href: "/library", label: "Library", icon: BookOpen },
    { href: "/recommendations", label: "Arsenal", icon: Star },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
        <Wordmark size="sm" />
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 p-6 space-y-8 sticky top-0 h-screen overflow-y-auto">
        <Wordmark />
        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const active = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(57,255,20,0.3)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Pro / Upgrade CTA */}
        {isPro ? (
          <Link href="/pricing" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition">
            <Crown className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Pro Active</span>
          </Link>
        ) : (
          <Link href="/pricing" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-black font-bold hover:opacity-90 transition shadow-[0_0_15px_rgba(57,255,20,0.25)]">
            <Crown className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono font-black uppercase tracking-widest">Upgrade to Pro</span>
          </Link>
        )}

        <div className="text-xs text-muted-foreground font-mono opacity-50">
          SYSTEM v1.0.4<br/>
          ALL SYSTEMS NOMINAL
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <TrialBanner />
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-2 z-50 pb-safe">
        {links.slice(0, 5).map((link) => {
          const active = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={`p-3 rounded-full ${active ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
              <link.icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
