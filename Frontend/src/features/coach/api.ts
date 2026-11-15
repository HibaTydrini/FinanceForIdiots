// Calls to the chatbot backend (backend/app.py).
// Set VITE_API_URL in Frontend/.env to point at a deployed backend; defaults to the local one.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

import type { Plan, StepInfo } from "../planning/babyStepsStore";
import type { Lesson } from "../../app/pageContext";
import { getActiveUserId, type OnboardingProfile } from "../onboarding/onboarding";

export type Source = { n: number; url: string };
export type ChatMessage = { role: "user" | "assistant"; text: string; sources?: Source[] };

// A random ID per browser, so the backend can find this user's profile.
// There are no accounts yet; clearing site data starts a new user.
export function getUserId(): string {
  return getActiveUserId() ?? "anonymous";
}

// Onboarding answers, in the order of `questions` in App.tsx.
export async function saveProfile(profile: OnboardingProfile): Promise<void> {
  const answers = profile.requiredAnswers;
  const res = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: getUserId(),
      knowledge: answers[0] ?? "",
      invested_in: answers[1] ?? "",
      goals: answers[2] ?? "",
      loss_reaction: answers[3] ?? "",
      financial_capacity: answers[4] ?? "",
      preliminary_risk: profile.preliminaryRisk,
      monthly_budget: profile.monthlyBudget,
      looking_for: answers[6] ?? "",
      optional_answers: profile.optionalAnswers,
      demo_client_id: profile.demoClientId ?? "",
    }),
  });
  if (!res.ok) throw new Error(`Saving profile failed (${res.status})`);
}

// What the chatbot is told about where the user is. Every field is optional.
export type ChatContext = {
  page?: string;                 // page name (AI Phone)
  lesson?: Lesson | null;        // lesson slide on screen (AI Phone)
  step?: StepInfo | null;        // Baby Step the user is on
  plan?: Plan;                   // their saved plan (My Plan)
  completedSteps?: string[];     // ids of finished Baby Steps
  nextAction?: string;           // the next unfinished thing, in words
};

// `history` must contain complete question/answer pairs only (the model requires
// user and assistant turns to alternate).
// `portfolio` is the demo client picked on the Portfolio page, if any.
// `context` is what the user is looking at (page, lesson, slide) and where they are in Baby Steps.
export async function sendChat(
  question: string,
  history: ChatMessage[],
  portfolio?: object,
  context?: ChatContext,
): Promise<{ answer: string; sources: Source[] }> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: getUserId(),
      question,
      history: history.map(({ role, text }) => ({ role, text })),
      portfolio: portfolio ?? null,
      context: context ?? null,
    }),
  });
  if (!res.ok) throw new Error(`Chat failed (${res.status})`);
  return res.json();
}
