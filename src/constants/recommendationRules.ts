// 17 deterministic rules. Each: condition + reason + estimated benefit.
import type { FootprintInput, Persona, Recommendation } from "@/types/footprint";

export interface Rule {
  id: string;
  category: Recommendation["category"];
  title: string;
  reason: string;
  estimatedBenefitKg: number;
  estimatedBenefitText: string;
  difficulty: Recommendation["difficulty"];
  priority: number;
  personas: Persona[] | "all";
  condition: (i: FootprintInput, p: Persona) => boolean;
}

const ALL_PERSONAS: Persona[] = ["student", "young_professional", "hosteller", "homeowner"];

const carKmPerMonth = (i: FootprintInput) =>
  (i.transport.petrol_car ?? 0) + (i.transport.diesel_car ?? 0);
const activeKm = (i: FootprintInput) => (i.transport.bike ?? 0) + (i.transport.walk ?? 0);
const totalWaste = (i: FootprintInput) =>
  i.wasteLandfillKg + i.wasteRecycledKg + i.wasteCompostedKg;

export const RULES: Rule[] = [
  // ── TRANSPORT
  {
    id: "T1",
    category: "transport",
    title: "Carpool 3 days a week",
    reason: "Daily car commute is your biggest avoidable hit.",
    estimatedBenefitKg: 35,
    estimatedBenefitText: "~35 kg CO₂e / month",
    difficulty: "easy",
    priority: 9,
    personas: ["student", "young_professional"],
    condition: (i) => carKmPerMonth(i) > 400,
  },
  {
    id: "T2",
    category: "transport",
    title: "Switch to metro / bus for the city commute",
    reason: "In a hostel an EV purchase isn't realistic — public transit cuts ~70%.",
    estimatedBenefitKg: 55,
    estimatedBenefitText: "~55 kg CO₂e / month",
    difficulty: "easy",
    priority: 10,
    personas: ["hosteller"],
    condition: (i) => carKmPerMonth(i) > 200,
  },
  {
    id: "T3",
    category: "transport",
    title: "Plan your next scooter as an EV",
    reason: "An EV scooter cuts per-km emissions roughly 4×.",
    estimatedBenefitKg: 18,
    estimatedBenefitText: "~18 kg CO₂e / month",
    difficulty: "hard",
    priority: 5,
    personas: "all",
    condition: (i) => (i.transport.scooter_petrol ?? 0) > 200,
  },
  {
    id: "T4",
    category: "transport",
    title: "Replace short flights with rail",
    reason: "One short flight ≈ 380 kg CO₂e — overnight train is a fraction.",
    estimatedBenefitKg: 380,
    estimatedBenefitText: "~380 kg CO₂e per flight skipped",
    difficulty: "medium",
    priority: 10,
    personas: "all",
    condition: (i) => i.flightsPerMonth >= 2,
  },
  {
    id: "T5",
    category: "transport",
    title: "Add walking or cycling for trips under 3 km",
    reason: "You logged no active transport — small trips add up.",
    estimatedBenefitKg: 6,
    estimatedBenefitText: "~6 kg CO₂e / month",
    difficulty: "easy",
    priority: 4,
    personas: "all",
    condition: (i) => activeKm(i) === 0,
  },

  // ── ENERGY
  {
    id: "E1",
    category: "energy",
    title: "Behavior swaps: standby, LED, laptop over desktop",
    reason: "In a hostel, behavior change beats hardware investment.",
    estimatedBenefitKg: 25,
    estimatedBenefitText: "~25 kg CO₂e / month",
    difficulty: "easy",
    priority: 8,
    personas: ["hosteller", "student"],
    condition: (i) => i.electricityUnitsKwh > 300,
  },
  {
    id: "E2",
    category: "energy",
    title: "Rooftop solar (3 kW residential)",
    reason: "You own the place and your grid use is high — solar pays back in ~4 yrs.",
    estimatedBenefitKg: 180,
    estimatedBenefitText: "~180 kg CO₂e / month",
    difficulty: "hard",
    priority: 9,
    personas: ["homeowner"],
    condition: (i) => i.electricityUnitsKwh > 300,
  },
  {
    id: "E3",
    category: "energy",
    title: "Set AC to 24 °C + 1-hour timer",
    reason: "Every degree below 24 °C adds ~6% to AC load.",
    estimatedBenefitKg: 22,
    estimatedBenefitText: "~22 kg CO₂e / month",
    difficulty: "easy",
    priority: 7,
    personas: "all",
    condition: (i) => i.acHoursPerDay >= 4,
  },
  {
    id: "E4",
    category: "energy",
    title: "Swap to LED + power-strip switch-off",
    reason: "Standby and old bulbs are quiet drains, especially for students.",
    estimatedBenefitKg: 8,
    estimatedBenefitText: "~8 kg CO₂e / month",
    difficulty: "easy",
    priority: 5,
    personas: ["student", "young_professional"],
    condition: (i) => i.electricityUnitsKwh > 150,
  },

  // ── FOOD
  {
    id: "F1",
    category: "food",
    title: "Drop meat to 3 days a week",
    reason: "Heavy meat diets average ~7.2 kg CO₂e / day.",
    estimatedBenefitKg: 70,
    estimatedBenefitText: "~70 kg CO₂e / month",
    difficulty: "medium",
    priority: 9,
    personas: "all",
    condition: (i) => i.diet === "heavy_meat",
  },
  {
    id: "F2",
    category: "food",
    title: "Two plant-based days a week",
    reason: "Even a mixed diet drops ~15 kg/month with two veg days.",
    estimatedBenefitKg: 15,
    estimatedBenefitText: "~15 kg CO₂e / month",
    difficulty: "easy",
    priority: 6,
    personas: "all",
    condition: (i) => i.diet === "mixed",
  },
  {
    id: "F3",
    category: "food",
    title: "Compost kitchen scraps",
    reason: "Food sent to landfill emits ~10× the CO₂ of composted scraps.",
    estimatedBenefitKg: 5,
    estimatedBenefitText: "~5 kg CO₂e / month",
    difficulty: "easy",
    priority: 4,
    personas: "all",
    condition: (i) => i.wasteCompostedKg === 0,
  },

  // ── WASTE
  {
    id: "W1",
    category: "waste",
    title: "Two-bin recycling at home",
    reason: "Less than 30% of your waste is recycled.",
    estimatedBenefitKg: 7,
    estimatedBenefitText: "~7 kg CO₂e / month",
    difficulty: "easy",
    priority: 5,
    personas: "all",
    condition: (i) => {
      const t = totalWaste(i);
      return t > 0 && i.wasteRecycledKg / t < 0.3;
    },
  },
  {
    id: "W2",
    category: "waste",
    title: "Start a balcony vermicompost",
    reason: "Cheap, odorless, and cuts landfill methane.",
    estimatedBenefitKg: 6,
    estimatedBenefitText: "~6 kg CO₂e / month",
    difficulty: "medium",
    priority: 4,
    personas: ["student", "young_professional", "homeowner"],
    condition: (i) => i.wasteCompostedKg === 0 && i.wasteLandfillKg > 5,
  },

  // ── WATER
  {
    id: "WA1",
    category: "water",
    title: "5-minute showers + aerator taps",
    reason: "Heated water dominates the water footprint — every minute counts.",
    estimatedBenefitKg: 3,
    estimatedBenefitText: "~3 kg CO₂e / month",
    difficulty: "easy",
    priority: 4,
    personas: "all",
    condition: (i) => i.waterLitersPerDay > 200,
  },
  {
    id: "WA2",
    category: "water",
    title: "Report dripping taps to hostel maintenance",
    reason: "A single dripping tap wastes ~75 L/day.",
    estimatedBenefitKg: 2,
    estimatedBenefitText: "~2 kg CO₂e / month",
    difficulty: "easy",
    priority: 3,
    personas: ["hosteller"],
    condition: (i) => i.waterLitersPerDay > 200,
  },
  {
    id: "WA3",
    category: "water",
    title: "Install a low-flow showerhead",
    reason: "One-time fix that pays back in weeks.",
    estimatedBenefitKg: 4,
    estimatedBenefitText: "~4 kg CO₂e / month",
    difficulty: "medium",
    priority: 4,
    personas: ["homeowner"],
    condition: (i) => i.waterLitersPerDay > 150,
  },
];

export function ruleMatchesPersona(rule: Rule, persona: Persona): boolean {
  return rule.personas === "all" || rule.personas.includes(persona);
}
