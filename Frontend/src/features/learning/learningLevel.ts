// Reading levels for the table of contents.
export type Level = "novice" | "intermediate" | "expert";

// Turns the first onboarding answer ("What is your investment knowledge?")
// into a reading level for the table of contents. Old and new quiz wordings both work.
export function levelFromKnowledge(answer?: string): Level {
  if (answer === "I understand the basics" || answer === "I understand stocks, ETFs, and risk") return "intermediate";
  if (answer === "I'm experienced with investing" || answer === "I'm experienced") return "expert";
  return "novice";
}
