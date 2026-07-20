import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, X } from "lucide-react";
import { Link } from "wouter";
import { customFetch } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;

type StripeStatus = {
  isActive: boolean;
  status: string | null;
  currentPeriodEnd: number | null;
};

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: status } = useQuery<StripeStatus>({
    queryKey: ["/api/stripe/status"],
    queryFn: () => customFetch<StripeStatus>(`${BASE}api/stripe/status`),
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed) return null;
  if (status?.status !== "trialing" || !status.currentPeriodEnd) return null;

  const daysLeft = Math.ceil(
    (status.currentPeriodEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft > 3 || daysLeft <= 0) return null;

  const label =
    daysLeft === 1
      ? "Your Pro trial ends tomorrow"
      : `Your Pro trial ends in ${daysLeft} days`;

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/30 px-5 py-2.5">
      <div className="flex items-center gap-2.5 text-sm">
        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-amber-200 font-medium">{label} —</span>
        <Link
          href="/pricing"
          className="text-amber-400 font-bold hover:underline"
        >
          Upgrade to keep Pro access
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/50 hover:text-amber-400 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
