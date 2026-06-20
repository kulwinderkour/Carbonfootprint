// Domain types for the Carbon Footprint Awareness Platform.

export type Persona = "student" | "young_professional" | "hosteller" | "homeowner";

export type Category = "transport" | "energy" | "food" | "waste" | "water";

export type VehicleType =
  | "petrol_car"
  | "diesel_car"
  | "electric_car"
  | "bus"
  | "metro"
  | "bike"
  | "walk"
  | "autorickshaw"
  | "scooter_petrol"
  | "flight_short";

export type DietType = "vegan" | "vegetarian" | "mixed" | "heavy_meat";

export type Housing = "hostel" | "rented_flat" | "own_home";

/** Raw user inputs from the calculator form (monthly basis). */
export interface FootprintInput {
  // Transport — km/month per mode
  transport: Partial<Record<VehicleType, number>>;
  flightsPerMonth: number;
  // Energy
  electricityUnitsKwh: number;
  housing: Housing;
  acHoursPerDay: number;
  // Food
  diet: DietType;
  // Waste — kg/month
  wasteLandfillKg: number;
  wasteRecycledKg: number;
  wasteCompostedKg: number;
  // Water — liters/day
  waterLitersPerDay: number;
}

export interface CategoryBreakdown {
  transport: number;
  energy: number;
  food: number;
  waste: number;
  water: number;
}

export interface FootprintResult {
  breakdown: CategoryBreakdown;
  totalKg: number;
  topCategory: Category;
  impact: "low" | "moderate" | "high";
}

export interface Recommendation {
  id: string;
  category: Category;
  title: string;
  reason: string;
  estimatedBenefitKg: number;
  estimatedBenefitText: string;
  difficulty: "easy" | "medium" | "hard";
  priority: number;
}

export interface WeeklyGoal {
  category: Category;
  description: string;
  targetReductionKg: number;
}

export interface FootprintEntryRow {
  id: string;
  user_id: string;
  inputs: FootprintInput;
  breakdown: CategoryBreakdown;
  total_kg: number;
  month: number;
  year: number;
  created_at: string;
}
