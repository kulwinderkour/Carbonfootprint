import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { CategoryBreakdown, FootprintInput, Persona } from "@/types/footprint";

const SaveSchema = z.object({
  inputs: z.record(z.string(), z.unknown()),
  breakdown: z.object({
    transport: z.number(),
    energy: z.number(),
    food: z.number(),
    waste: z.number(),
    water: z.number(),
  }),
  totalKg: z.number().min(0).max(1_000_000),
});

export const saveFootprintEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const now = new Date();
    const { error, data: row } = await context.supabase
      .from("footprint_entries")
      .insert({
        user_id: context.userId,
        inputs: data.inputs as never,
        breakdown: data.breakdown as never,
        total_kg: data.totalKg,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getFootprintHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("footprint_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const PersonaSchema = z.object({
  persona: z.enum(["student", "young_professional", "hosteller", "homeowner"]),
});

export const updatePersona = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => PersonaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, persona: data.persona }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { id: context.userId, name: null, persona: "student" as Persona };
  });

// Save a generated weekly goal
const GoalSchema = z.object({
  category: z.enum(["transport", "energy", "food", "waste", "water"]),
  description: z.string().min(1).max(280),
  targetReductionKg: z.number().min(0).max(10000),
});
export const saveGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => GoalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const { error } = await context.supabase.from("goals").insert({
      user_id: context.userId,
      category: data.category,
      description: data.description,
      target_reduction_kg: data.targetReductionKg,
      week_start: monday.toISOString().slice(0, 10),
    });
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const getGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
