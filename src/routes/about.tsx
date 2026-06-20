import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Verdant works — Methodology &amp; sources" },
      {
        name: "description",
        content:
          "Methodology, emission factors, recommendation logic, and data sources used by Verdant.",
      },
      { property: "og:title", content: "How Verdant works" },
      { property: "og:description", content: "Methodology, emission factors, and data sources." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Layout>
      <article className="prose prose-neutral max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">How Verdant works</h1>
        <p className="mt-2 text-muted-foreground">
          We use peer-reviewed and government-published emission factors to translate your monthly
          habits into kilograms of CO₂-equivalent.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Emission factors</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-1.5 pr-4">Category</th>
              <th>Factor</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody className="border-t border-border">
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Petrol car</td>
              <td>0.192 kg/km</td>
              <td>DEFRA 2023</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Electricity (India)</td>
              <td>0.82 kg/kWh</td>
              <td>CEA India v19 (2023)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Mixed diet</td>
              <td>4.5 kg/day</td>
              <td>Poore &amp; Nemecek, Science 2018</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Landfill waste</td>
              <td>0.5 kg/kg</td>
              <td>US EPA WARM v15</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Water (treat + heat)</td>
              <td>0.298 kg/kL</td>
              <td>India MoJS</td>
            </tr>
          </tbody>
        </table>

        <h2 className="mt-8 text-xl font-semibold">Recommendation engine</h2>
        <p>
          17 deterministic rules score against your inputs and persona. Each rule has a difficulty,
          an estimated monthly benefit, and a relevance filter (e.g. "rooftop solar" only fires for
          homeowners). The top 5 by <code>priority × benefit</code> are shown.
        </p>

        <h2 className="mt-8 text-xl font-semibold">AI coach</h2>
        <p>
          The coach message is generated server-side via Lovable AI Gateway (Gemini). The API key
          never reaches the browser; failures fall back to a deterministic message.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Privacy &amp; security</h2>
        <p>
          All footprint data is scoped per user via row-level security: no other user can read your
          entries. The service-role key is server-only.
        </p>
      </article>
    </Layout>
  );
}
