import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  Calculator,
  LineChart,
  Sparkles,
  Bot,
  Bike,
  Bolt,
  Apple,
  Recycle,
  Droplets,
  ShieldCheck,
  BookOpen,
  Globe2,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdant — Carbon Footprint Awareness for Urban India" },
      {
        name: "description",
        content:
          "Calculate, understand, and shrink your monthly carbon footprint. Built for students and young professionals in urban India.",
      },
      { property: "og:title", content: "Verdant — Carbon Footprint Awareness" },
      {
        property: "og:description",
        content: "Calculate, understand, and shrink your monthly carbon footprint.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="rounded-3xl bg-[image:var(--gradient-hero)] p-8 text-primary-foreground md:p-14">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Leaf className="h-3.5 w-3.5" aria-hidden /> For urban students &amp; young
            professionals
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Know your carbon. Shrink it weekly.
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Verdant turns your monthly habits into a clear CO₂ number, names your biggest lever, and
            gives you one habit to start this week — coached by AI.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/calculator">Calculate my footprint</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="bg-white/10 text-primary-foreground hover:bg-white/20"
            >
              <Link to="/about">How it works</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-primary-foreground/80">
            Free to use · No ads · Your data stays private to your account
          </p>
        </div>
      </section>

      {/* Trust stats */}
      <section aria-labelledby="stats" className="mt-12 grid gap-6 sm:grid-cols-3">
        <h2 id="stats" className="sr-only">
          By the numbers
        </h2>
        {[
          { k: "1.9 t", v: "India's average per-capita CO₂e / year" },
          { k: "17", v: "Peer-reviewed emission factors used" },
          { k: "<2 min", v: "to log a month and see your trend" },
        ].map((s) => (
          <div key={s.v} className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-primary">{s.k}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="mt-16 grid gap-6 md:grid-cols-3">
        <h2 id="features" className="sr-only">
          Features
        </h2>
        {[
          {
            icon: Calculator,
            title: "Honest math",
            body: "17 emission factors from DEFRA 2023, CEA India v19, EPA WARM v15, and Poore & Nemecek 2018.",
          },
          {
            icon: Bot,
            title: "AI coach",
            body: "Tap the robot button anytime for a warm, specific reply tuned to your latest footprint.",
          },
          {
            icon: LineChart,
            title: "Weekly progress",
            body: "Track up to 24 entries, see your trend line, and lock in weekly goals you'll actually keep.",
          },
        ].map((f) => (
          <article
            key={f.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elev-1)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="mt-20">
        <div className="mb-8 max-w-2xl">
          <h2 id="how" className="text-3xl font-bold tracking-tight">
            How Verdant works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three steps. No spreadsheets, no jargon, no guilt-trips.
          </p>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Log a month",
              b: "Answer a 2-minute form about transport, electricity, meals, water and waste.",
            },
            {
              n: "2",
              t: "See your number",
              b: "Get total kg CO₂e, a category breakdown, and how you compare to the India average.",
            },
            {
              n: "3",
              t: "Pick one habit",
              b: "The AI coach suggests one realistic weekly habit ranked by impact — you commit, we track.",
            },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Categories */}
      <section aria-labelledby="cats" className="mt-20">
        <div className="mb-8 max-w-2xl">
          <h2 id="cats" className="text-3xl font-bold tracking-tight">
            What we measure
          </h2>
          <p className="mt-2 text-muted-foreground">
            Five everyday categories that cover ~95% of an urban resident's footprint.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Bike, t: "Transport", b: "Car, two-wheeler, bus, metro, flights." },
            { icon: Bolt, t: "Energy", b: "Grid electricity, LPG, geyser hours." },
            { icon: Apple, t: "Food", b: "Diet type, dairy, restaurant meals." },
            { icon: Droplets, t: "Water", b: "Heating, daily use estimates." },
            { icon: Recycle, t: "Waste", b: "Landfill, recycling, composting." },
          ].map((c) => (
            <article key={c.t} className="rounded-2xl border border-border bg-card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/40 text-primary">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section aria-labelledby="voices" className="mt-20">
        <h2 id="voices" className="text-3xl font-bold tracking-tight">
          What early users say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              q: "Finally a calculator that doesn't lecture me. The one-habit nudge actually stuck.",
              a: "Aarav, 24 — Bengaluru",
            },
            {
              q: "I switched my commute after seeing transport was 58% of my footprint. Down 22% in a month.",
              a: "Riya, 22 — Mumbai",
            },
            {
              q: "The AI coach feels like a friend who happens to know climate science.",
              a: "Kabir, 27 — Delhi",
            },
          ].map((t) => (
            <figure key={t.a} className="rounded-2xl border border-border bg-card p-6">
              <blockquote className="text-sm leading-relaxed text-foreground">"{t.q}"</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">{t.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section aria-labelledby="trust" className="mt-20 grid gap-6 md:grid-cols-3">
        <h2 id="trust" className="sr-only">
          Why trust Verdant
        </h2>
        {[
          {
            icon: ShieldCheck,
            t: "Private by default",
            b: "Your entries are encrypted and tied to your account. No selling, no profiling.",
          },
          {
            icon: BookOpen,
            t: "Cited sources",
            b: "Every factor links back to its source. Numbers you can defend in any room.",
          },
          {
            icon: Globe2,
            t: "India-calibrated",
            b: "Built around CEA India grid mix and local commute patterns — not generic global averages.",
          },
        ].map((t) => (
          <article key={t.t} className="rounded-2xl border border-border bg-card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <t.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold">{t.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.b}</p>
          </article>
        ))}
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mt-20">
        <h2 id="faq" className="text-3xl font-bold tracking-tight">
          Frequently asked
        </h2>
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              q: "Is Verdant free?",
              a: "Yes. Core calculator, AI coach and progress tracking are free.",
            },
            {
              q: "How accurate is it?",
              a: "Within ±10–15% for typical users. We use peer-reviewed factors and surface uncertainty honestly.",
            },
            {
              q: "Do I need to be in India?",
              a: "It works anywhere, but the grid factor and commute data are tuned for urban India.",
            },
            {
              q: "What does the AI coach do?",
              a: "It reads your latest footprint and answers questions in plain language. Tap the robot at the bottom-right.",
            },
            {
              q: "Where is my data stored?",
              a: "In your private account with row-level security. Only you can read your entries.",
            },
            {
              q: "Can I export my data?",
              a: "Yes — every entry stays in your account and can be exported on request.",
            },
          ].map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="mt-20 overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] p-10 text-center text-primary-foreground md:p-14">
        <Sparkles className="mx-auto h-8 w-8 opacity-90" aria-hidden />
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Your first habit is two minutes away.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
          Log your first month, meet the AI coach, and lock in one weekly goal. That's it.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link to="/calculator">
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
