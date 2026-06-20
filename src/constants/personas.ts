import type { Persona } from "@/types/footprint";

export const PERSONAS: Array<{ id: Persona; label: string; description: string }> = [
  {
    id: "student",
    label: "Student",
    description: "College / university, often on a tight budget.",
  },
  {
    id: "young_professional",
    label: "Young professional",
    description: "Early-career, urban commute.",
  },
  {
    id: "hosteller",
    label: "Hosteller",
    description: "Living in a shared hostel — limited control over utilities.",
  },
  {
    id: "homeowner",
    label: "Homeowner",
    description: "Owns the place — can invest in solar / appliances.",
  },
];

export const PERSONA_LABEL: Record<Persona, string> = {
  student: "Student",
  young_professional: "Young professional",
  hosteller: "Hosteller",
  homeowner: "Homeowner",
};
