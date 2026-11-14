// Reading levels for the table of contents.
export type Level = "novice" | "intermediate" | "expert";

// Turns the first onboarding answer ("How would you describe your investing knowledge?")
// into a reading level for the table of contents.
export function levelFromKnowledge(answer?: string): Level {
  if (answer === "I understand stocks, ETFs, and risk") return "intermediate";
  if (answer === "I'm experienced") return "expert";
  return "novice";
}
