import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatKg } from "@/lib/format";

export interface HistoryPoint {
  date: string;
  total: number;
}

export function ProgressChart({ data }: { data: HistoryPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No history yet — log your first footprint to see a trend line.
      </p>
    );
  }
  return (
    <figure aria-labelledby="progress-title">
      <figcaption id="progress-title" className="mb-3 text-sm font-medium text-muted-foreground">
        Total monthly footprint over time
      </figcaption>
      <div
        className="h-64 w-full"
        role="img"
        aria-label="Line chart showing total monthly carbon footprint over time. See list below."
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatKg(v)} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {data.map((d) => (
          <li key={d.date} className="flex justify-between">
            <span>{d.date}</span>
            <span className="tabular-nums">{formatKg(d.total)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
