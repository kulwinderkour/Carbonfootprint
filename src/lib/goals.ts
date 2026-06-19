import type { Recommendation, WeeklyGoal } from "@/types/footprint";

/**
 * Generate up to 3 weekly goals from the top recommendations.
 * Goals are framed in concrete, weekly language.
 */
export function generateWeeklyGoals(recs: Recommendation[]): WeeklyGoal[] {
  return recs.slice(0, 3).map((r) => ({
    category: r.category,
    description: `This week: ${r.title.toLowerCase()}.`,
    // weekly target ≈ monthly benefit / 4, rounded to whole kg
    targetReductionKg: Math.max(1, Math.round(r.estimatedBenefitKg / 4)),
  }));
}
