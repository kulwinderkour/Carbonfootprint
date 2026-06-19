import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, saveFootprintEntry, updatePersona } from "@/lib/footprint.functions";
import { sanitizeFootprintInput } from "@/lib/validation";
import { calculateFootprint } from "@/lib/calculator";
import { PERSONAS } from "@/constants/personas";
import type { FootprintInput, Persona } from "@/types/footprint";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({ meta: [{ title: "Calculator — Verdant" }, { name: "description", content: "Log your monthly footprint." }] }),
  component: CalculatorPage,
});

const empty: FootprintInput = {
  transport: { petrol_car: 0, scooter_petrol: 0, bus: 0, metro: 0, bike: 0, walk: 0, autorickshaw: 0, electric_car: 0, diesel_car: 0, flight_short: 0 },
  flightsPerMonth: 0,
  electricityUnitsKwh: 0,
  housing: "rented_flat",
  acHoursPerDay: 0,
  diet: "mixed",
  wasteLandfillKg: 0,
  wasteRecycledKg: 0,
  wasteCompostedKg: 0,
  waterLitersPerDay: 0,
};

function NumberField({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} inputMode="numeric" value={value} onChange={(e) => onChange(Number(e.target.value || 0))} aria-describedby={hint ? `${id}-hint` : undefined} />
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CalculatorPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const profileFn = useServerFn(getProfile);
  const saveFn = useServerFn(saveFootprintEntry);
  const personaFn = useServerFn(updatePersona);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn({}) });
  const [persona, setPersona] = useState<Persona | null>(null);
  const effectivePersona: Persona = persona ?? (profile.data?.persona as Persona | undefined) ?? "student";

  const [input, setInput] = useState<FootprintInput>(empty);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => calculateFootprint(sanitizeFootprintInput(input)), [input]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const clean = sanitizeFootprintInput(input);
      const result = calculateFootprint(clean);
      if (persona && persona !== profile.data?.persona) {
        await personaFn({ data: { persona } });
      }
      await saveFn({ data: { inputs: clean as unknown as Record<string, unknown>, breakdown: result.breakdown, totalKg: result.totalKg } });
      await qc.invalidateQueries({ queryKey: ["history"] });
      toast.success("Footprint logged.");
      router.navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save entry.");
    } finally { setSubmitting(false); }
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Log this month</h1>
        <p className="mt-1 text-muted-foreground">Fill what applies. Skip the rest — leave zero for things you didn't use.</p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Persona */}
          <section aria-labelledby="persona-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="persona-h" className="mb-3 text-lg font-semibold">About you</h2>
            <Label htmlFor="persona">I'm a…</Label>
            <Select value={effectivePersona} onValueChange={(v) => setPersona(v as Persona)}>
              <SelectTrigger id="persona"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERSONAS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label} — <span className="text-muted-foreground">{p.description}</span></SelectItem>)}
              </SelectContent>
            </Select>
          </section>

          {/* Transport */}
          <section aria-labelledby="t-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="t-h" className="mb-4 text-lg font-semibold">🚗 Transport (km / month)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="petrol_car" label="Petrol car" value={input.transport.petrol_car ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, petrol_car: n } })} />
              <NumberField id="scooter" label="Petrol scooter" value={input.transport.scooter_petrol ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, scooter_petrol: n } })} />
              <NumberField id="bus" label="Bus" value={input.transport.bus ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, bus: n } })} />
              <NumberField id="metro" label="Metro" value={input.transport.metro ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, metro: n } })} />
              <NumberField id="auto" label="Autorickshaw" value={input.transport.autorickshaw ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, autorickshaw: n } })} />
              <NumberField id="bike" label="Bicycle" value={input.transport.bike ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, bike: n } })} />
              <NumberField id="walk" label="Walking" value={input.transport.walk ?? 0} onChange={(n) => setInput({ ...input, transport: { ...input.transport, walk: n } })} />
              <NumberField id="flights" label="Short flights this month" value={input.flightsPerMonth} onChange={(n) => setInput({ ...input, flightsPerMonth: n })} hint="A return trip counts as one." />
            </div>
          </section>

          {/* Energy */}
          <section aria-labelledby="e-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="e-h" className="mb-4 text-lg font-semibold">💡 Energy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="kwh" label="Electricity bill (kWh / month)" value={input.electricityUnitsKwh} onChange={(n) => setInput({ ...input, electricityUnitsKwh: n })} hint="Check 'units consumed' on your bill." />
              <NumberField id="ac" label="AC hours per day (avg)" value={input.acHoursPerDay} onChange={(n) => setInput({ ...input, acHoursPerDay: n })} />
              <div>
                <Label htmlFor="housing">Housing</Label>
                <Select value={input.housing} onValueChange={(v) => setInput({ ...input, housing: v as FootprintInput["housing"] })}>
                  <SelectTrigger id="housing"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="rented_flat">Rented flat</SelectItem>
                    <SelectItem value="own_home">Own home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Food */}
          <section aria-labelledby="f-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="f-h" className="mb-4 text-lg font-semibold">🥗 Food</h2>
            <Label htmlFor="diet">Diet</Label>
            <Select value={input.diet} onValueChange={(v) => setInput({ ...input, diet: v as FootprintInput["diet"] })}>
              <SelectTrigger id="diet"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="mixed">Mixed (some meat)</SelectItem>
                <SelectItem value="heavy_meat">Heavy meat (daily)</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* Waste */}
          <section aria-labelledby="w-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="w-h" className="mb-4 text-lg font-semibold">🗑️ Waste (kg / month)</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField id="landfill" label="Landfill" value={input.wasteLandfillKg} onChange={(n) => setInput({ ...input, wasteLandfillKg: n })} />
              <NumberField id="recycled" label="Recycled" value={input.wasteRecycledKg} onChange={(n) => setInput({ ...input, wasteRecycledKg: n })} />
              <NumberField id="composted" label="Composted" value={input.wasteCompostedKg} onChange={(n) => setInput({ ...input, wasteCompostedKg: n })} />
            </div>
          </section>

          {/* Water */}
          <section aria-labelledby="wa-h" className="rounded-2xl border border-border bg-card p-6">
            <h2 id="wa-h" className="mb-4 text-lg font-semibold">💧 Water</h2>
            <NumberField id="water" label="Liters per day (estimate)" value={input.waterLitersPerDay} onChange={(n) => setInput({ ...input, waterLitersPerDay: n })} hint="Average urban use: 135 L/day." />
          </section>
        </div>

        {/* Sticky preview */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Live preview</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{preview.totalKg.toFixed(0)}<span className="text-base font-medium text-muted-foreground"> kg CO₂e/mo</span></p>
            <p className="mt-1 text-sm">
              Impact:{" "}
              <span className="font-medium" style={{ color: `var(--color-impact-${preview.impact})` }}>
                {preview.impact.toUpperCase()}
              </span>
            </p>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Save &amp; see recommendations"}
          </Button>
        </aside>
      </form>
    </Layout>
  );
}
