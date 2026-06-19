import { RULES, ruleMatchesPersona } from "@/constants/recommendationRules";
import type { FootprintInput, Persona, Recommendation } from "@/types/footprint";

/**
 * Deterministic recommendation engine.
 * Returns top 5 recommendations ranked by priority * estimatedBenefitKg.
 */
export function getRecommendations(
  input: FootprintInput,
  persona: Persona,
  limit = 5,
): Recommendation[] {
  const matches = RULES.filter(
    (r) => ruleMatchesPersona(r, persona) && r.condition(input, persona),
  );
  matches.sort((a, b) => b.priority * b.estimatedBenefitKg - a.priority * a.estimatedBenefitKg);
  return matches.slice(0, limit).map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    reason: r.reason,
    estimatedBenefitKg: r.estimatedBenefitKg,
    estimatedBenefitText: r.estimatedBenefitText,
    difficulty: r.difficulty,
    priority: r.priority,
  }));
}
