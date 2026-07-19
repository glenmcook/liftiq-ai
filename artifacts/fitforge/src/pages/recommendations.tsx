import { useGetRecommendations } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ExternalLink, Star, MapPin } from "lucide-react";

const DEXA_PROVIDERS = [
  {
    name: "DexaFit",
    tagline: "Nationwide Network",
    description:
      "The largest DEXA scanning network in the US. Over 100 locations across 40+ cities. Full body composition reports with VO2 Max and RMR testing available.",
    url: "https://www.dexafit.com",
    highlights: ["100+ locations", "VO2 Max add-on", "RMR testing", "Digital report"],
    accent: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    dot: "bg-blue-400",
  },
  {
    name: "BodySpec",
    tagline: "Affordable & Accessible",
    description:
      "High-accuracy DEXA scans at one of the lowest price points available. Mobile trucks come to your city on a rotating schedule — no clinic visit needed.",
    url: "https://www.bodyspec.com",
    highlights: ["~$45/scan", "Mobile trucks", "App-based tracking", "No appointment wait"],
    accent: "text-primary",
    border: "border-primary/30",
    bg: "bg-primary/5",
    dot: "bg-primary",
  },
  {
    name: "Kalos",
    tagline: "Precision Body Comp",
    description:
      "Clinic-grade DEXA scanning with in-depth analysis and one-on-one consultations. Focuses on athletes and body recomposition with detailed regional breakdowns.",
    url: "https://www.getkalos.com",
    highlights: ["Regional breakdown", "Athlete focus", "Consultation included", "Trend tracking"],
    accent: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    dot: "bg-purple-400",
  },
  {
    name: "Fitnescity",
    tagline: "Book Any Lab Near You",
    description:
      "Marketplace that aggregates DEXA scan slots at hospitals, universities, and performance labs nationwide. Best way to find a certified provider in your zip code.",
    url: "https://www.fitnescity.com",
    highlights: ["Lab aggregator", "Hospital-grade", "Zip code search", "RMR & VO2 too"],
    accent: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    dot: "bg-orange-400",
  },
  {
    name: "Life Time",
    tagline: "In-Gym Scanning",
    description:
      "Many Life Time Athletic clubs offer DEXA scans on-site through their Performance services. Convenient if you're already a member — no extra travel required.",
    url: "https://www.lifetime.life/life-time-offerings/health-services/dexa-scan.html",
    highlights: ["Member perk", "On-site clinics", "Paired coaching", "Multiple cities"],
    accent: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    dot: "bg-red-400",
  },
];

export default function Recommendations() {
  const { data: recs, isLoading } = useGetRecommendations();

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <header className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase flex items-center gap-4">
            <Star className="w-10 h-10 text-primary" /> Arsenal
          </h1>
          <p className="text-primary font-mono text-sm tracking-widest">RECOMMENDED SUPPLIES & EQUIPMENT</p>
        </header>

        {/* ── DEXA Scanning Section ──────────────────────────────────────────── */}
        <section id="dexa" className="space-y-5 scroll-mt-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold uppercase tracking-widest">DEXA Scanning</h2>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
              Recommended
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            DEXA is the gold standard for body composition tracking — far more accurate than scales or calipers.
            These are the top providers trusted by serious athletes and coaches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEXA_PROVIDERS.map((provider) => (
              <div
                key={provider.name}
                className={`bg-card border ${provider.border} rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-all group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 ${provider.bg} pointer-events-none`} />

                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${provider.dot} shrink-0`} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      {provider.tagline}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-extrabold uppercase tracking-tight ${provider.accent}`}>
                    {provider.name}
                  </h3>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed relative z-10 flex-1">
                  {provider.description}
                </p>

                <div className="relative z-10 flex flex-wrap gap-1.5">
                  {provider.highlights.map((h) => (
                    <span key={h} className="text-[10px] font-mono bg-background border border-border px-2 py-1 rounded-full text-muted-foreground">
                      {h}
                    </span>
                  ))}
                </div>

                <a
                  href={provider.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-widest border transition-all
                    bg-background border-border hover:border-current hover:${provider.accent} hover:bg-card ${provider.accent}`}
                >
                  Find a Location <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI Recommendations ────────────────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold uppercase tracking-widest">AI Picks</h2>
          </div>

          {isLoading ? (
            <div className="animate-pulse font-mono text-primary tracking-widest py-10">SCANNING MARKETPLACE...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recs?.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] transition-all flex flex-col h-full group"
                >
                  {rec.imageUrl && (
                    <div className="h-56 bg-secondary w-full relative overflow-hidden">
                      <img
                        src={rec.imageUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col relative">
                    {!rec.imageUrl && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    )}
                    <div className="mb-4 relative z-10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-primary/20 text-primary px-3 py-1.5 rounded-full border border-primary/30">
                        {rec.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-2 relative z-10 leading-tight">
                      {rec.title}
                    </h3>
                    {rec.brand && (
                      <div className="text-xs font-mono text-muted-foreground mb-4 tracking-widest bg-background inline-block px-2 py-1 rounded relative z-10">
                        {rec.brand}
                      </div>
                    )}
                    <p className="text-sm text-foreground/80 flex-1 leading-relaxed relative z-10">
                      {rec.description}
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/50 text-xs font-mono text-primary italic leading-relaxed relative z-10">
                      " {rec.relevanceReason} "
                    </div>
                    {rec.affiliateUrl && (
                      <a
                        href={rec.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 flex items-center justify-center gap-2 bg-secondary border border-border text-foreground py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all relative z-10"
                      >
                        Acquire <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
