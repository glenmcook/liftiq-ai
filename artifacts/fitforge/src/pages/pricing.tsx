import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Check, Zap, Loader2, Crown, Lock } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

type Price = { id: string; unitAmount: number; currency: string; recurring: { interval: string } | null };
type Product = { id: string; name: string; description: string; metadata: Record<string, string>; prices: Price[] };
type SubscriptionStatus = {
  isActive: boolean; status: string | null; planName: string | null;
  currentPeriodEnd: number | null; stripeCustomerId: string | null;
};

const FREE_FEATURES = [
  "Dashboard & command center",
  "Session history & logs",
  "Progress charts",
  "Exercise library",
  "Manual workout logging",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI training plan generation",
  "AI check-in & readiness scoring",
  "Nutrition fuel protocol (AI diet)",
  "DEXA scan AI parsing",
  "Unlimited plan regeneration",
  "Arsenal AI recommendations",
];

function formatPrice(unitAmount: number, interval: string) {
  const dollars = unitAmount / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}/${interval === "year" ? "yr" : "mo"}`;
}

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">("month");

  const { data: status, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/status"],
    queryFn: () => fetch(`${BASE}api/stripe/status`).then(r => r.json()),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/stripe/products"],
    queryFn: () => fetch(`${BASE}api/stripe/products`).then(r => r.json()),
  });

  const checkout = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await fetch(`${BASE}api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      return data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}api/stripe/portal`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal failed");
      return data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  // Find the Pro product and selected price
  const proProduct = productsData?.data?.find(p => p.name.toLowerCase().includes("pro")) ?? productsData?.data?.[0];
  const proPrice = proProduct?.prices?.find(p => p.recurring?.interval === selectedInterval)
    ?? proProduct?.prices?.[0];

  const isLoading = statusLoading || productsLoading;

  return (
    <Layout>
      <div className="space-y-10 pb-20 max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center space-y-3 pt-4">
          <h1 className="text-4xl font-extrabold tracking-widest uppercase">Upgrade</h1>
          <p className="text-primary font-mono text-sm tracking-widest">UNLOCK THE FULL PROTOCOL</p>
        </header>

        {/* Active subscription banner */}
        {status?.isActive && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary" />
              <div>
                <div className="font-bold text-primary uppercase tracking-wide text-sm">LiftIQ Pro — Active</div>
                {status.currentPeriodEnd && (
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    Renews {new Date(status.currentPeriodEnd * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary font-mono text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition"
            >
              {portal.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Manage Billing"}
            </button>
          </div>
        )}

        {/* Billing toggle */}
        {!status?.isActive && (
          <div className="flex justify-center">
            <div className="bg-card border border-border rounded-full p-1 flex gap-1 font-mono text-xs font-bold uppercase tracking-widest">
              <button
                onClick={() => setSelectedInterval("month")}
                className={`px-5 py-2 rounded-full transition-all ${selectedInterval === "month" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval("year")}
                className={`px-5 py-2 rounded-full transition-all flex items-center gap-2 ${selectedInterval === "year" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
              >
                Annual <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${selectedInterval === "year" ? "bg-black/20" : "bg-primary/20 text-primary"}`}>SAVE 30%</span>
              </button>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-7 flex flex-col gap-6">
            <div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Free</div>
              <div className="text-4xl font-black text-foreground">$0</div>
              <div className="text-sm text-muted-foreground mt-1">No credit card required</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono">Free forever</div>
            </div>
            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 rounded-xl border border-border text-center font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Current Plan
            </div>
          </div>

          {/* Pro */}
          <div className="bg-card border-2 border-primary rounded-2xl p-7 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-xl">
              Recommended
            </div>
            <div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Pro
              </div>
              {isLoading ? (
                <div className="h-10 w-24 bg-border animate-pulse rounded" />
              ) : proPrice ? (
                <>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-black text-foreground">
                      {formatPrice(proPrice.unitAmount, proPrice.recurring?.interval ?? "month")}
                    </div>
                    <div className="text-sm text-muted-foreground pb-1.5">after trial</div>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-3 py-1">
                    <span className="text-primary text-xs font-black font-mono uppercase tracking-wider">14-day free trial</span>
                  </div>
                  {selectedInterval === "year" && (
                    <div className="text-xs text-primary font-mono mt-1.5">
                      ${((proPrice.unitAmount / 100) / 12).toFixed(2)}/mo billed annually
                    </div>
                  )}
                </>
              ) : (
                <div className="text-4xl font-black text-foreground">—</div>
              )}
            </div>

            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                  <Check className={`w-4 h-4 shrink-0 mt-0.5 ${i === 0 ? "text-muted-foreground" : "text-primary"}`} /> {f}
                </li>
              ))}
            </ul>

            {!status?.isActive && (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com (for receipt)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary outline-none"
                />
                <button
                  onClick={() => proPrice && checkout.mutate(proPrice.id)}
                  disabled={!proPrice || checkout.isPending || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-black font-black uppercase tracking-widest rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {checkout.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Zap className="w-4 h-4" /> Start Free Trial</>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground font-mono">
                  No charge for 14 days · Cancel anytime
                </p>
                {checkout.isError && (
                  <p className="text-xs text-red-400 text-center font-mono">{(checkout.error as any)?.message}</p>
                )}
              </div>
            )}

            {status?.isActive && (
              <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-center font-mono text-xs font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                <Crown className="w-3.5 h-3.5" /> Active
              </div>
            )}
          </div>
        </div>

        {/* Pro features detail */}
        <div className="bg-card border border-border rounded-2xl p-7 space-y-5">
          <h2 className="text-lg font-extrabold uppercase tracking-widest">What's Included in Pro</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🧠", title: "AI Training Plans", desc: "Personalized programs generated by AI based on your goals, experience, and schedule." },
              { icon: "📊", title: "AI Check-in", desc: "Daily readiness scoring with AI coaching adjustments based on how you're recovering." },
              { icon: "🥗", title: "Nutrition Protocol", desc: "Custom macro targets and a full daily meal plan tailored to your body composition goals." },
              { icon: "🔬", title: "DEXA AI Parsing", desc: "Upload your body composition report — AI extracts all metrics automatically." },
              { icon: "⚡", title: "Unlimited Regeneration", desc: "Regenerate your plan or diet protocol anytime as your goals and metrics change." },
              { icon: "🎯", title: "Arsenal Recommendations", desc: "AI-curated equipment, supplement, and training resource suggestions." },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-4 bg-background rounded-xl border border-border/50">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-bold text-sm uppercase tracking-wide mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
