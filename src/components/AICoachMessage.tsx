import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateCoachMessage } from "@/lib/ai-coach.functions";
import type { Category, Persona } from "@/types/footprint";

interface Props {
  persona: Persona;
  totalKg: number;
  topCategory: Category;
  previousTotalKg?: number | null;
}

export function AICoachMessage({ persona, totalKg, topCategory, previousTotalKg }: Props) {
  const fn = useServerFn(generateCoachMessage);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fn({ data: { persona, totalKg, topCategory, previousTotalKg: previousTotalKg ?? null } })
      .then((r) => { if (!cancelled) setText(r.message); })
      .catch((e: unknown) => { if (!cancelled) setErr(e instanceof Error ? e.message : "Coach unavailable"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fn, persona, totalKg, topCategory, previousTotalKg]);

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/30 p-5"
    >
      <header className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" aria-hidden /> AI-powered coach
      </header>
      {loading && <p className="text-sm text-muted-foreground">Writing your personalized message…</p>}
      {!loading && err && <p className="text-sm text-destructive">{err}</p>}
      {!loading && !err && text && <p className="text-foreground leading-relaxed">{text}</p>}
    </section>
  );
}
