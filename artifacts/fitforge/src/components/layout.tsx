import { Link, useLocation } from "wouter";
import { Dumbbell, Home, LineChart, History, Activity, Sparkles, Settings, Star, Flame } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/plan", label: "Protocol", icon: Dumbbell },
    { href: "/history", label: "History", icon: History },
    { href: "/progress", label: "Progress", icon: LineChart },
    { href: "/dexa", label: "DEXA Scans", icon: Activity },
    { href: "/checkin", label: "AI Check-in", icon: Sparkles },
    { href: "/recommendations", label: "Arsenal", icon: Star },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Flame className="w-6 h-6" /> FITFORGE
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 p-6 space-y-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tighter">
          <Flame className="w-8 h-8" /> FITFORGE
        </div>
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
        <div className="text-xs text-muted-foreground font-mono opacity-50">
          SYSTEM v1.0.4<br/>
          ALL SYSTEMS NOMINAL
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
        {children}
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
