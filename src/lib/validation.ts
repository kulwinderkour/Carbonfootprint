import { INPUT_LIMITS } from "@/constants/emissionFactors";
import type { FootprintInput, VehicleType } from "@/types/footprint";

/** Clamp a numeric value into [min, max]; coerce NaN/null/undefined to min. */
export function clamp(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

const TRANSPORT_KEYS: VehicleType[] = [
  "petrol_car",
  "diesel_car",
  "electric_car",
  "bus",
  "metro",
  "bike",
  "walk",
  "autorickshaw",
  "scooter_petrol",
  "flight_short",
];

/** Sanitize a raw form payload into a strongly-typed, clamped FootprintInput. */
export function sanitizeFootprintInput(
  raw: Partial<FootprintInput> | Record<string, unknown>,
): FootprintInput {
  const r = raw as Partial<FootprintInput>;
  const transport: FootprintInput["transport"] = {};
  for (const key of TRANSPORT_KEYS) {
    transport[key] = clamp(
      r.transport?.[key],
      INPUT_LIMITS.kmPerMonth.min,
      INPUT_LIMITS.kmPerMonth.max,
    );
  }
  const diet = (r.diet ?? "mixed") as FootprintInput["diet"];
  const housing = (r.housing ?? "rented_flat") as FootprintInput["housing"];
  return {
    transport,
    flightsPerMonth: clamp(
      r.flightsPerMonth,
      INPUT_LIMITS.flightsPerMonth.min,
      INPUT_LIMITS.flightsPerMonth.max,
    ),
    electricityUnitsKwh: clamp(
      r.electricityUnitsKwh,
      INPUT_LIMITS.electricityKwh.min,
      INPUT_LIMITS.electricityKwh.max,
    ),
    housing: ["hostel", "rented_flat", "own_home"].includes(housing) ? housing : "rented_flat",
    acHoursPerDay: clamp(
      r.acHoursPerDay,
      INPUT_LIMITS.acHoursPerDay.min,
      INPUT_LIMITS.acHoursPerDay.max,
    ),
    diet: ["vegan", "vegetarian", "mixed", "heavy_meat"].includes(diet) ? diet : "mixed",
    wasteLandfillKg: clamp(r.wasteLandfillKg, INPUT_LIMITS.wasteKg.min, INPUT_LIMITS.wasteKg.max),
    wasteRecycledKg: clamp(r.wasteRecycledKg, INPUT_LIMITS.wasteKg.min, INPUT_LIMITS.wasteKg.max),
    wasteCompostedKg: clamp(r.wasteCompostedKg, INPUT_LIMITS.wasteKg.min, INPUT_LIMITS.wasteKg.max),
    waterLitersPerDay: clamp(
      r.waterLitersPerDay,
      INPUT_LIMITS.waterLitersPerDay.min,
      INPUT_LIMITS.waterLitersPerDay.max,
    ),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
