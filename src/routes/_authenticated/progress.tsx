import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/Layout";
import { getFootprintHistory, getGoals } from "@/lib/footprint.functions";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { formatKg } from "@/lib/format";
import type { FootprintEntryRow } from "@/types/footprint";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — Verdant" }, { name: "description", content: "Your footprint trend and weekly goals." }] }),
  component: Progress,
});

function Progress() {
  const histFn = useServerFn(getFootprintHistory);
  const goalFn = useServerFn(getGoals);
  const history = useQuery({ queryKey: ["history"], queryFn: () => histFn({}) });
  const goals = useQuery({ queryKey: ["goals"], queryFn: () => goalFn({}) });

  const rows = (history.data as FootprintEntryRow[] | undefined) ?? [];
  const chartData = [...rows]
    .reverse()
    .map((r) => ({ date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }), total: r.total_kg }));

  const first = rows[rows.length - 1];
  const latest = rows[0];
  const delta = first && latest && first !== latest ? latest.total_kg - first.total_kg : null;

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="mt-1 text-muted-foreground">Your last {rows.length} entries.</p>
      </header>

      {delta !== null && (
        <p className={`mb-6 rounded-xl border border-border p-4 text-sm ${delta < 0 ? "bg-primary/10 text-primary" : "bg-accent/30"}`}>
          {delta < 0
            ? `🌿 You've cut ${formatKg(Math.abs(delta))} CO₂e since you started.`
            : `Up ${formatKg(delta)} since your first entry — let's reverse it.`}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <ProgressChart data={chartData} />
      </section>

      <section aria-labelledby="g-h" className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 id="g-h" className="mb-4 text-xl font-semibold">Your weekly goals</h2>
        {goals.data && goals.data.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {(goals.data as Array<{ id: string; description: string; target_reduction_kg: number; week_start: string; status: string }>).map((g) => (
              <li key={g.id} className="flex justify-between rounded-lg border border-border p-3">
                <span>{g.description}</span>
                <span className="text-muted-foreground">Week of {g.week_start} · {formatKg(g.target_reduction_kg)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No goals saved yet. Set some from the dashboard.</p>
        )}
      </section>
    </Layout>
  );
}
