import type { Recommendation } from "@/types/footprint";
import { CATEGORY_META } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Big change" } as const;

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const meta = CATEGORY_META[rec.category];
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elev-1)]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden style={{ background: meta.tokenVar }} className="grid h-8 w-8 place-items-center rounded-lg text-base text-white">{meta.icon}</span>
          <h3 className="font-semibold leading-tight">{rec.title}</h3>
        </div>
        <Badge variant="secondary">{DIFFICULTY_LABEL[rec.difficulty]}</Badge>
      </header>
      <p className="text-sm text-muted-foreground">{rec.reason}</p>
      <p className="text-sm font-medium text-primary">{rec.estimatedBenefitText}</p>
    </article>
  );
}

export function RecommendationPanel({ recs }: { recs: Recommendation[] }) {
  if (recs.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        You're already lean — no high-impact suggestions for now. 🌱
      </p>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recs.map((r) => <RecommendationCard key={r.id} rec={r} />)}
    </div>
  );
}
