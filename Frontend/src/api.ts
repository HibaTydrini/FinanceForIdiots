// Calls to the chatbot backend (backend/app.py).
// Set VITE_API_URL in Frontend/.env to point at a deployed backend; defaults to the local one.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
      goals: answers[1] ?? "",
      time_horizon: answers[2] ?? "",
      risk_reaction: answers[3] ?? "",
      looking_for: answers[4] ?? "",
      nbc_linked: (answers[5] ?? "").startsWith("Yes"),
    }),
  });
  if (!res.ok) throw new Error(`Saving profile failed (${res.status})`);
}

// `history` must contain complete question/answer pairs only (the model requires
// user and assistant turns to alternate).
export async function sendChat(
  question: string,
  history: ChatMessage[],
): Promise<{ answer: string; sources: Source[] }> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: getUserId(),
      question,
      history: history.map(({ role, text }) => ({ role, text })),
    }),
  });
  if (!res.ok) throw new Error(`Chat failed (${res.status})`);
  return res.json();
}
