import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";

const CoachSchema = z.object({
  persona: z.enum(["student", "young_professional", "hosteller", "homeowner"]).optional(),
  totalKg: z.number().min(0).max(1_000_000).nullable().optional(),
  topCategory: z.enum(["transport", "energy", "food", "waste", "water"]).nullable().optional(),
  previousTotalKg: z.number().min(0).max(1_000_000).nullable().optional(),
});

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
  context: CoachSchema.optional(),
});

const FALLBACK = (totalKg: number, top: string) =>
  `Your monthly footprint is about ${totalKg.toFixed(0)} kg CO₂e — ${top} is your biggest lever. Start with one small weekly habit and build from there.`;

const GENERIC_FALLBACK =
  "I'm your Verdant carbon coach. Try the calculator to log a month, then ask me anything about transport, energy, food, water or waste — I'll suggest one small habit you can start this week.";

function buildSystemPrompt(ctx?: z.infer<typeof CoachSchema>) {
  const base = `You are Verdant, a warm, practical carbon-coach for urban Indian students and young professionals.
Rules:
- Reply in plain text, max 4 short sentences, no markdown lists, no emojis.
- Be specific and actionable. Always suggest ONE concrete habit when relevant.
- If asked something off-topic, gently steer back to climate, footprint or sustainable habits.
- Use kg CO₂e units. Reference DEFRA / CEA India factors when accuracy matters.`;
  if (!ctx || ctx.totalKg == null || !ctx.topCategory) return base;
  return `${base}

User context: persona=${ctx.persona ?? "unknown"}, monthly footprint=${ctx.totalKg.toFixed(0)} kg CO₂e, biggest category=${ctx.topCategory}${
    ctx.previousTotalKg != null ? `, previous month=${ctx.previousTotalKg.toFixed(0)} kg` : ""
  }.`;
}

export const chatWithCoach = createServerFn({ method: "POST" })
  .validator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { message: GENERIC_FALLBACK, source: "fallback" as const };

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const system = buildSystemPrompt(data.context);

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        messages: data.messages,
      });
      const clean = (text ?? "").trim();
      return { message: clean || GENERIC_FALLBACK, source: "ai" as const };
    } catch (e) {
      console.error("[coach] gateway error", e);
      return { message: GENERIC_FALLBACK, source: "fallback" as const };
    }
  });

export const generateCoachMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        persona: z.enum(["student", "young_professional", "hosteller", "homeowner"]),
        totalKg: z.number().min(0).max(1_000_000),
        topCategory: z.enum(["transport", "energy", "food", "waste", "water"]),
        previousTotalKg: z.number().min(0).max(1_000_000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key)
      return { message: FALLBACK(data.totalKg, data.topCategory), source: "fallback" as const };
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const trend =
      data.previousTotalKg != null
        ? data.totalKg < data.previousTotalKg
          ? `You're down from ${data.previousTotalKg.toFixed(0)} kg last time — keep it going.`
          : `You're slightly up from ${data.previousTotalKg.toFixed(0)} kg last time.`
        : `This is your first reading.`;
    const prompt = `You are a friendly carbon-coach for an urban Indian ${data.persona.replace("_", " ")}.
Their monthly footprint is ${data.totalKg.toFixed(0)} kg CO₂e and the largest category is ${data.topCategory}. ${trend}
Write a single warm, specific paragraph (max 3 sentences, no lists, no emojis) that:
1) acknowledges their result without judgment,
2) names the top category as their best lever,
3) gives ONE concrete habit they can start this week.`;
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });
      const clean = (text ?? "").trim();
      return { message: clean || FALLBACK(data.totalKg, data.topCategory), source: "ai" as const };
    } catch (e) {
      console.error("[coach] gateway error", e);
      return { message: FALLBACK(data.totalKg, data.topCategory), source: "fallback" as const };
    }
  });
