import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { CategoryBreakdown } from "@/types/footprint";
import { CATEGORY_META, formatKg } from "@/lib/format";

export function CategoryBreakdownChart({ breakdown }: { breakdown: CategoryBreakdown }) {
  const data = useMemo(
    () =>
      (Object.keys(breakdown) as Array<keyof CategoryBreakdown>)
        .map((k) => ({ name: CATEGORY_META[k].label, value: breakdown[k], key: k }))
        .filter((d) => d.value > 0),
    [breakdown],
  );
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <figure aria-labelledby="breakdown-title">
      <figcaption id="breakdown-title" className="mb-3 text-sm font-medium text-muted-foreground">
        Monthly breakdown by category
      </figcaption>
      <div className="h-64 w-full" role="img" aria-label="Pie chart of carbon footprint by category. See text summary below.">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} strokeWidth={2}>
              {data.map((d) => (
                <Cell key={d.key} fill={CATEGORY_META[d.key].tokenVar} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatKg(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Screen-reader-friendly text alternative */}
      <ul className="mt-2 space-y-1 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span aria-hidden style={{ background: CATEGORY_META[d.key].tokenVar }} className="inline-block h-2.5 w-2.5 rounded-full" />
              <span aria-hidden>{CATEGORY_META[d.key].icon}</span>
              <span>{CATEGORY_META[d.key].label}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatKg(d.value)} ({total ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
