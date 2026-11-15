// Calls to the chatbot backend (backend/app.py).
// Set VITE_API_URL in Frontend/.env to point at a deployed backend; defaults to the local one.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

import type { BabyState, Plan, StepInfo } from "./babyStepsStore";
import type { Lesson } from "./pageContext";

export type Source = { n: number; url: string };
export type ChatMessage = { role: "user" | "assistant"; text: string; sources?: Source[] };

// A random ID per browser, so the backend can find this user's profile.
// There are no accounts yet; clearing site data starts a new user.
export function getUserId(): string {
  const key = "ffi-user-id";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "anonymous"; // storage blocked (private mode): chat still works, without a saved profile
  }
}

// Onboarding answers, in the order of `questions` in App.tsx.
export async function saveProfile(answers: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: getUserId(),
      knowledge: answers[0] ?? "",
      invested_in: answers[1] ?? "",
      goals: answers[2] ?? "",
      risk_tolerance: answers[3] ?? "",
      looking_for: answers[4] ?? "",
    }),
  });
  if (!res.ok) throw new Error(`Saving profile failed (${res.status})`);
}

// ---------- progress (Baby Steps, plan, weekly email opt-in), saved on the server ----------

export type EmailSettings = { address: string; consent: boolean };

// Every field is optional: the server only replaces the parts that are sent.
export type ProgressUpdate = {
  state?: BabyState;
  answers?: string[];
  nextAction?: string;
  nextActionId?: string; // "" when the next thing isn't an action that can be ticked
  actions?: { id: string; label: string; step: string }[];
  email?: EmailSettings;
  timeZone?: string; // the browser's, so calendar tasks land at the right local time
};

export type ServerProgress = { state?: Partial<BabyState>; email?: EmailSettings };

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // not JSON: use the fallback
  }
  return `${fallback} (${res.status})`;
}

export async function putProgress(update: ProgressUpdate): Promise<void> {
  const res = await fetch(`${API_URL}/progress/${encodeURIComponent(getUserId())}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Saving progress failed"));
}

// null when the server has nothing saved for this user yet.
export async function getProgress(): Promise<ServerProgress | null> {
  const res = await fetch(`${API_URL}/progress/${encodeURIComponent(getUserId())}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await errorMessage(res, "Reading progress failed"));
  return res.json();
}

// Sends the weekly check-in email now (the demo trigger). Returns where it went and its opening text.
export async function sendCheckin(): Promise<{ to: string; nudge: string; booked: CalendarTask | null }> {
  const res = await fetch(`${API_URL}/checkins/send/${encodeURIComponent(getUserId())}`, { method: "POST" });
  if (!res.ok) throw new Error(await errorMessage(res, "Sending the check-in failed"));
  return res.json();
}

// ---------- Google Calendar (the AI agent adds tasks to a "Finance for idiots" calendar) ----------

export type CalendarTask = { title: string; start: string; link?: string };
export type CalendarStatus = { configured: boolean; connected: boolean; upcoming: CalendarTask[] };

// Where the "Connect Google Calendar" button goes (the backend sends the user on to Google).
export function googleConnectUrl(): string {
  return `${API_URL}/google/connect/${encodeURIComponent(getUserId())}`;
}

export async function getCalendarStatus(): Promise<CalendarStatus> {
  const res = await fetch(`${API_URL}/google/status/${encodeURIComponent(getUserId())}`);
  if (!res.ok) throw new Error(await errorMessage(res, "Reading the calendar status failed"));
  return res.json();
}

export async function disconnectCalendar(): Promise<void> {
  const res = await fetch(`${API_URL}/google/disconnect/${encodeURIComponent(getUserId())}`, { method: "POST" });
  if (!res.ok) throw new Error(await errorMessage(res, "Disconnecting failed"));
}

// ---------- Activity feed: what the coach did, and why (Home page) ----------

export type Activity = {
  at: string; // ISO time (UTC)
  kind: "email" | "calendar" | "skip" | "tick" | "answer" | "settings";
  title: string;
  reason: string;
  by: "own" | "asked"; // on its own, or because the user asked
  link?: string;
};

export async function getActivity(): Promise<Activity[]> {
  const res = await fetch(`${API_URL}/activity/${encodeURIComponent(getUserId())}`);
  if (!res.ok) throw new Error(await errorMessage(res, "Reading the activity failed"));
  return (await res.json()).activity;
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
): Promise<{ answer: string; sources: Source[]; tasks?: CalendarTask[] }> {
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
