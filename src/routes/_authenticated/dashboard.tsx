import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getFootprintHistory, getProfile, saveGoal } from "@/lib/footprint.functions";
import { calculateFootprint } from "@/lib/calculator";
import { getRecommendations } from "@/lib/recommendations";
import { generateWeeklyGoals } from "@/lib/goals";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { RecommendationPanel } from "@/components/RecommendationPanel";

import { CATEGORY_META, formatKg } from "@/lib/format";
import { INDIA_AVERAGE_MONTHLY_KG } from "@/constants/emissionFactors";
import type {
  CategoryBreakdown,
  FootprintEntryRow,
  FootprintInput,
  Persona,
} from "@/types/footprint";
import { sanitizeFootprintInput } from "@/lib/validation";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Verdant" },
      { name: "description", content: "Your latest carbon footprint and recommendations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const histFn = useServerFn(getFootprintHistory);
  const profileFn = useServerFn(getProfile);
  const goalFn = useServerFn(saveGoal);

  const history = useQuery({ queryKey: ["history"], queryFn: () => histFn({}) });
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({}) });

  const latest = (history.data as FootprintEntryRow[] | undefined)?.[0];
  const previous = (history.data as FootprintEntryRow[] | undefined)?.[1];

  const recs = useMemo(() => {
    if (!latest) return [];
    return getRecommendations(
      sanitizeFootprintInput(latest.inputs as Partial<FootprintInput>),
      (profile.data?.persona as Persona) ?? "student",
    );
  }, [latest, profile.data?.persona]);

  const goals = useMemo(() => generateWeeklyGoals(recs), [recs]);

  if (history.isLoading || profile.isLoading) {
    return (
      <Layout>
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </Layout>
    );
  }

  if (!latest) {
    return (
      <Layout>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold">No footprint yet</h1>
          <p className="mt-2 text-muted-foreground">
            Log your first month to unlock recommendations and the AI coach.
          </p>
          <Button asChild className="mt-5">
            <Link to="/calculator">Start calculator</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const result = calculateFootprint(
    sanitizeFootprintInput(latest.inputs as Partial<FootprintInput>),
  );
  const breakdown = (latest.breakdown ?? result.breakdown) as CategoryBreakdown;
  const diffVsIndia = Math.round(
    ((latest.total_kg - INDIA_AVERAGE_MONTHLY_KG) / INDIA_AVERAGE_MONTHLY_KG) * 100,
  );

  async function commit(idx: number) {
    const g = goals[idx];
    if (!g) return;
    try {
      await goalFn({ data: g });
      toast.success("Goal saved for this week.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save goal.");
    }
  }

  return (
    <Layout>
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your monthly footprint</h1>
          <p className="mt-1 text-muted-foreground">
            Latest entry from {new Date(latest.created_at).toLocaleDateString()}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/calculator">Log a new month</Link>
        </Button>
      </header>

      <section aria-label="Headline metric" className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground">
          <p className="text-sm/relaxed text-primary-foreground/80">Monthly CO₂-equivalent</p>
          <p className="mt-1 text-5xl font-bold tabular-nums">
            {latest.total_kg.toFixed(0)}
            <span className="ml-1 text-lg font-medium">kg</span>
          </p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {diffVsIndia >= 0 ? `${diffVsIndia}% above` : `${Math.abs(diffVsIndia)}% below`} the
            India average ({INDIA_AVERAGE_MONTHLY_KG} kg/mo).
          </p>
          <p className="mt-3 text-sm">
            Biggest lever:{" "}
            <span className="font-semibold">{CATEGORY_META[result.topCategory].label}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Impact tier</p>
          <p
            className="mt-1 text-3xl font-bold capitalize"
            style={{ color: `var(--color-impact-${result.impact})` }}
          >
            {result.impact}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tiers: Low &lt; 200 kg · Moderate 200–500 · High &gt; 500.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <CategoryBreakdownChart breakdown={breakdown} />
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/30 p-6">
          <h2 className="text-lg font-semibold">Need ideas? Ask the AI coach.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the robot button in the bottom-right corner to chat with Verdant's AI coach. It
            already knows your latest footprint ({latest.total_kg.toFixed(0)} kg) and biggest lever
            ({CATEGORY_META[result.topCategory].label.toLowerCase()}) — ask for one habit, a swap,
            or a deeper explainer.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Previous month:{" "}
            {previous ? `${previous.total_kg.toFixed(0)} kg CO₂e` : "no prior reading yet"}.
          </p>
        </div>
      </div>

      <section aria-labelledby="recs-h" className="mt-12">
        <h2 id="recs-h" className="mb-4 text-2xl font-semibold tracking-tight">
          Top recommendations for you
        </h2>
        <RecommendationPanel recs={recs} />
      </section>

      <section
        aria-labelledby="goals-h"
        className="mt-12 rounded-2xl border border-border bg-card p-6"
      >
        <h2 id="goals-h" className="mb-4 text-xl font-semibold tracking-tight">
          Suggested weekly goals
        </h2>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals to suggest — you're doing great.</p>
        ) : (
          <ul className="space-y-3">
            {goals.map((g, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
              >
                <div>
                  <p className="text-sm font-medium">{g.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Target this week: {formatKg(g.targetReductionKg)} CO₂e
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => commit(i)}>
                  Set goal
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
