import { useGetRecommendations } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ExternalLink, Star } from "lucide-react";

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

        {isLoading ? (
           <div className="animate-pulse font-mono text-primary tracking-widest py-10">SCANNING MARKETPLACE...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recs?.map(rec => (
              <div key={rec.id} className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] transition-all flex flex-col h-full group">
                {rec.imageUrl && (
                  <div className="h-56 bg-secondary w-full relative overflow-hidden">
                    <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col relative">
                  {!rec.imageUrl && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />}
                  
                  <div className="mb-4 relative z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-primary/20 text-primary px-3 py-1.5 rounded-full border border-primary/30">{rec.category}</span>
                  </div>
                  
                  <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-2 relative z-10 leading-tight">{rec.title}</h3>
                  {rec.brand && <div className="text-xs font-mono text-muted-foreground mb-4 tracking-widest bg-background inline-block px-2 py-1 rounded relative z-10">{rec.brand}</div>}
                  
                  <p className="text-sm text-foreground/80 flex-1 leading-relaxed relative z-10">{rec.description}</p>
                  
                  <div className="mt-6 pt-6 border-t border-border/50 text-xs font-mono text-primary italic leading-relaxed relative z-10">
                    " {rec.relevanceReason} "
                  </div>
                  
                  {rec.affiliateUrl && (
                    <a href={rec.affiliateUrl} target="_blank" rel="noreferrer" className="mt-8 flex items-center justify-center gap-2 bg-secondary border border-border text-foreground py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all relative z-10">
                      Acquire <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
