import { describe, expect, it } from "vitest";
import {
  calculateFootprint,
  calcEnergy,
  calcTransport,
  calcFood,
  calcWaste,
  calcWater,
  categoryPercentages,
} from "@/lib/calculator";
import { sanitizeFootprintInput, clamp } from "@/lib/validation";
import { getRecommendations } from "@/lib/recommendations";
import { generateWeeklyGoals } from "@/lib/goals";
import type { FootprintInput } from "@/types/footprint";

const empty: FootprintInput = {
  transport: {},
  flightsPerMonth: 0,
  electricityUnitsKwh: 0,
  housing: "rented_flat",
  acHoursPerDay: 0,
  diet: "vegan",
  wasteLandfillKg: 0,
  wasteRecycledKg: 0,
  wasteCompostedKg: 0,
  waterLitersPerDay: 0,
};

describe("clamp & validation", () => {
  it("clamps negatives to min", () => expect(clamp(-5, 0, 100)).toBe(0));
  it("clamps overflow to max", () => expect(clamp(9999, 0, 100)).toBe(100));
  it("coerces NaN/undefined to min", () => {
    expect(clamp(NaN, 0, 100)).toBe(0);
    expect(clamp(undefined, 0, 100)).toBe(0);
  });
  it("clamps numeric strings correctly", () => {
    expect(clamp("50", 0, 100)).toBe(50);
  });
  it("sanitizes a wild payload", () => {
    const out = sanitizeFootprintInput({
      transport: { petrol_car: -99 },
      electricityUnitsKwh: 1e9,
      diet: "bogus" as never,
    } as never);
    expect(out.transport.petrol_car).toBe(0);
    expect(out.electricityUnitsKwh).toBe(10000);
    expect(out.diet).toBe("mixed");
  });
});

describe("emissionCalculator", () => {
  it("zero inputs ⇒ zero except food baseline", () => {
    const r = calculateFootprint(empty);
    // vegan baseline: 1.5 * 30 = 45
    expect(r.breakdown.transport).toBe(0);
    expect(r.breakdown.food).toBe(45);
  });
  it("petrol car 100km ⇒ 19.2 kg", () => {
    expect(calcTransport({ ...empty, transport: { petrol_car: 100 } })).toBeCloseTo(19.2, 2);
  });
  it("electricity 100 kWh ⇒ 82 kg", () => {
    expect(calcEnergy({ ...empty, electricityUnitsKwh: 100 })).toBeCloseTo(82, 1);
  });
  it("mixed diet ⇒ 135 kg/month", () => expect(calcFood({ ...empty, diet: "mixed" })).toBe(135));
  it("waste sum", () => {
    expect(
      calcWaste({ ...empty, wasteLandfillKg: 10, wasteRecycledKg: 10, wasteCompostedKg: 10 }),
    ).toBeCloseTo(6.5, 2);
  });
  it("water — 200 L/day", () =>
    expect(calcWater({ ...empty, waterLitersPerDay: 200 })).toBeCloseTo(1.79, 1));
  it("breakdown sums to total", () => {
    const i: FootprintInput = {
      ...empty,
      transport: { petrol_car: 200 },
      electricityUnitsKwh: 250,
      diet: "mixed",
      wasteLandfillKg: 5,
      waterLitersPerDay: 150,
    };
    const r = calculateFootprint(i);
    const sum =
      r.breakdown.transport +
      r.breakdown.energy +
      r.breakdown.food +
      r.breakdown.waste +
      r.breakdown.water;
    expect(r.totalKg).toBeCloseTo(sum, 2);
  });
  it("impact tier high when >500", () => {
    const r = calculateFootprint({
      ...empty,
      transport: { petrol_car: 2000 },
      electricityUnitsKwh: 400,
      diet: "heavy_meat",
    });
    expect(r.impact).toBe("high");
  });
  it("percentages sum to ~100", () => {
    const r = calculateFootprint({ ...empty, transport: { petrol_car: 100 }, diet: "mixed" });
    const p = categoryPercentages(r.breakdown);
    const sum = p.transport + p.energy + p.food + p.waste + p.water;
    expect(sum).toBeGreaterThan(99.5);
    expect(sum).toBeLessThan(100.5);
  });
  it("ac hours energy calculation", () => {
    expect(calcEnergy({ ...empty, acHoursPerDay: 5, electricityUnitsKwh: 100 })).toBeCloseTo(
      266.5,
      1,
    );
  });
  it("percentages when total emissions is zero", () => {
    const p = categoryPercentages({ transport: 0, energy: 0, food: 0, waste: 0, water: 0 });
    expect(p.transport).toBe(0);
    expect(p.energy).toBe(0);
    expect(p.food).toBe(0);
    expect(p.waste).toBe(0);
    expect(p.water).toBe(0);
  });
});

describe("recommendationEngine", () => {
  it("returns T1 for daily car user (student)", () => {
    const recs = getRecommendations({ ...empty, transport: { petrol_car: 600 } }, "student");
    expect(recs.find((r) => r.id === "T1")).toBeDefined();
  });
  it("T2 (not E2) for hosteller with high energy", () => {
    const recs = getRecommendations(
      { ...empty, transport: { petrol_car: 300 }, electricityUnitsKwh: 400 },
      "hosteller",
    );
    expect(recs.find((r) => r.id === "E1")).toBeDefined();
    expect(recs.find((r) => r.id === "E2")).toBeUndefined();
  });
  it("E2 fires for homeowner with high energy", () => {
    const recs = getRecommendations({ ...empty, electricityUnitsKwh: 500 }, "homeowner");
    expect(recs.find((r) => r.id === "E2")).toBeDefined();
  });
  it("returns at most 5", () => {
    const recs = getRecommendations(
      {
        ...empty,
        transport: { petrol_car: 1000, scooter_petrol: 400 },
        flightsPerMonth: 3,
        electricityUnitsKwh: 600,
        acHoursPerDay: 6,
        diet: "heavy_meat",
        wasteLandfillKg: 30,
        wasteRecycledKg: 1,
        wasteCompostedKg: 0,
        waterLitersPerDay: 300,
      },
      "homeowner",
    );
    expect(recs.length).toBeLessThanOrEqual(5);
  });
  it("persona filtering: T2 only for hosteller", () => {
    const recs = getRecommendations({ ...empty, transport: { petrol_car: 500 } }, "homeowner");
    expect(recs.find((r) => r.id === "T2")).toBeUndefined();
  });
  it("sorted by priority × benefit (descending score)", () => {
    const recs = getRecommendations(
      {
        ...empty,
        transport: { petrol_car: 500 },
        flightsPerMonth: 3,
        diet: "heavy_meat",
      },
      "student",
    );
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].priority * recs[i].estimatedBenefitKg).toBeGreaterThanOrEqual(
        recs[i + 1].priority * recs[i + 1].estimatedBenefitKg,
      );
    }
  });
});

describe("goalGenerator", () => {
  it("creates up to 3 weekly goals", () => {
    const recs = getRecommendations(
      {
        ...empty,
        transport: { petrol_car: 500 },
        flightsPerMonth: 3,
        diet: "heavy_meat",
      },
      "student",
    );
    const goals = generateWeeklyGoals(recs);
    expect(goals.length).toBeLessThanOrEqual(3);
    goals.forEach((g) => expect(g.targetReductionKg).toBeGreaterThan(0));
  });
});
