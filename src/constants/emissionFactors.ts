/**
 * Emission factors for the Carbon Footprint Awareness Platform.
 *
 * Sources:
 * - Transport: UK DEFRA 2023 GHG conversion factors; India MoEF road-transport averages.
 *   https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting
 * - Electricity (India grid): Central Electricity Authority (CEA) CO2 Baseline Database
 *   for the Indian Power Sector, v19 (2023) — 0.82 kg CO2e/kWh average.
 * - Food: Poore & Nemecek, Science 2018 — production-stage diet averages.
 * - Waste: US EPA WARM v15 — landfill / recycling / composting end-of-life factors.
 * - Water: India MoJS energy intensity of urban water treatment + heating.
 * - India per-capita average: Our World in Data, 2022 — ~1.9 t CO2e/yr ≈ 150 kg/month.
 * All factors expressed as kg CO2-equivalent.
 */

import type { DietType, VehicleType } from "@/types/footprint";

/** kg CO2e per km */
export const TRANSPORT_FACTORS: Record<VehicleType, number> = {
  petrol_car: 0.192,
  diesel_car: 0.171,
  electric_car: 0.053,
  bus: 0.089,
  metro: 0.041,
  bike: 0,
  walk: 0,
  autorickshaw: 0.097,
  scooter_petrol: 0.083,
  flight_short: 0.255,
};


/* Average short-haul return flight (~1500 km round trip). */
export const FLIGHT_KG_PER_TRIP = 1500 * TRANSPORT_FACTORS.flight_short;

/* kg CO2e per kWh — India grid */
export const INDIA_GRID_KG_PER_KWH = 0.82;

/* Approx. AC consumption — 1.5 kW unit, monthly hours derived from acHoursPerDay * 30. */
export const AC_KW = 1.5;

/** kg CO2e per day per person, by diet (multiply by 30 for monthly). */
export const DIET_KG_PER_DAY: Record<DietType, number> = {
  vegan: 1.5,
  vegetarian: 2.5,
  mixed: 4.5,
  heavy_meat: 7.2,
};

/** kg CO2e per kg of waste, by stream. */
export const WASTE_FACTORS = {
  landfill: 0.5,
  recycled: 0.1,
  composted: 0.05,
} as const;

/** kg CO2e per 1000 liters of treated + heated water. */
export const WATER_KG_PER_KL = 0.298;

/** India per-capita average benchmark (kg CO2e/month). */
export const INDIA_AVERAGE_MONTHLY_KG = 150;

/** Impact tier thresholds. Overridable via Remote Config-style settings. */
export const IMPACT_THRESHOLDS = {
  low: 200,
  moderate: 500,
} as const;

/* Input clamps — defensive limits to prevent absurd values. */
export const INPUT_LIMITS = {
  kmPerMonth: { min: 0, max: 10000 },
  flightsPerMonth: { min: 0, max: 30 },
  electricityKwh: { min: 0, max: 10000 },
  acHoursPerDay: { min: 0, max: 24 },
  wasteKg: { min: 0, max: 500 },
  waterLitersPerDay: { min: 0, max: 2000 },
} as const;



