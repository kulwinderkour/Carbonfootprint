// Pure emission-calculation engine. No side effects, no IO.
import {
  AC_KW, DIET_KG_PER_DAY, FLIGHT_KG_PER_TRIP, IMPACT_THRESHOLDS,
  INDIA_GRID_KG_PER_KWH, TRANSPORT_FACTORS, WASTE_FACTORS, WATER_KG_PER_KL,
} from "@/constants/emissionFactors";
import type {
  Category, CategoryBreakdown, FootprintInput, FootprintResult,
} from "@/types/footprint";
import { round2 } from "./validation";

export function calcTransport(input: FootprintInput): number {
  let total = 0;
  for (const [mode, km] of Object.entries(input.transport)) {
    const factor = TRANSPORT_FACTORS[mode as keyof typeof TRANSPORT_FACTORS] ?? 0;
    total += (km ?? 0) * factor;
  }
  total += input.flightsPerMonth * FLIGHT_KG_PER_TRIP;
  return round2(total);
}

export function calcEnergy(input: FootprintInput): number {
  const baseline = input.electricityUnitsKwh * INDIA_GRID_KG_PER_KWH;
  const acKwh = input.acHoursPerDay * 30 * AC_KW;
  return round2(baseline + acKwh * INDIA_GRID_KG_PER_KWH);
}

export function calcFood(input: FootprintInput): number {
  return round2(DIET_KG_PER_DAY[input.diet] * 30);
}

export function calcWaste(input: FootprintInput): number {
  return round2(
    input.wasteLandfillKg * WASTE_FACTORS.landfill +
    input.wasteRecycledKg * WASTE_FACTORS.recycled +
    input.wasteCompostedKg * WASTE_FACTORS.composted,
  );
}

export function calcWater(input: FootprintInput): number {
  const monthlyKL = (input.waterLitersPerDay * 30) / 1000;
  return round2(monthlyKL * WATER_KG_PER_KL);
}

export function calculateFootprint(input: FootprintInput): FootprintResult {
  const breakdown: CategoryBreakdown = {
    transport: calcTransport(input),
    energy: calcEnergy(input),
    food: calcFood(input),
    waste: calcWaste(input),
    water: calcWater(input),
  };
  const totalKg = round2(
    breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste + breakdown.water,
  );
  const topCategory = (Object.entries(breakdown) as Array<[Category, number]>).reduce(
    (top, cur) => (cur[1] > top[1] ? cur : top),
    ["transport", 0] as [Category, number],
  )[0];
  let impact: FootprintResult["impact"] = "high";
  if (totalKg < IMPACT_THRESHOLDS.low) impact = "low";
  else if (totalKg < IMPACT_THRESHOLDS.moderate) impact = "moderate";
  return { breakdown, totalKg, topCategory, impact };
}

export function categoryPercentages(breakdown: CategoryBreakdown): Record<Category, number> {
  const total = breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste + breakdown.water;
  if (total === 0) return { transport: 0, energy: 0, food: 0, waste: 0, water: 0 };
  return {
    transport: round2((breakdown.transport / total) * 100),
    energy: round2((breakdown.energy / total) * 100),
    food: round2((breakdown.food / total) * 100),
    waste: round2((breakdown.waste / total) * 100),
    water: round2((breakdown.water / total) * 100),
  };
}
