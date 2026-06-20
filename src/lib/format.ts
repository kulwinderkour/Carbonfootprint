import type { Category } from "@/types/footprint";

export const CATEGORY_META: Record<Category, { label: string; icon: string; tokenVar: string }> = {
  transport: { label: "Transport", icon: "🚗", tokenVar: "var(--color-cat-transport)" },
  energy: { label: "Energy", icon: "💡", tokenVar: "var(--color-cat-energy)" },
  food: { label: "Food", icon: "🥗", tokenVar: "var(--color-cat-food)" },
  waste: { label: "Waste", icon: "🗑️", tokenVar: "var(--color-cat-waste)" },
  water: { label: "Water", icon: "💧", tokenVar: "var(--color-cat-water)" },
};

export function formatKg(n: number): string {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}
