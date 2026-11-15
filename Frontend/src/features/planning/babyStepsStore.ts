// Baby Steps progress and the user's long-term plan.
// Saved in localStorage under "financeBabySteps" (same idea as "financeQuizAnswers"),
// so a page reload keeps everything. Used by BabySteps, MyPlan, Home, Coach and the AI Phone.
import { useSyncExternalStore } from "react";
import data from "../../data/babySteps.json";
import type { TermDef } from "../../shared/RichText";
import { readActiveProfile } from "../onboarding/onboarding";

// ---------- the path (data/babySteps.json) ----------

export type CheckQuestion = { q: string; options: string[]; answer: number; explain: string };
export type MixOption = { id: string; name: string; stocks: number; bonds: number; cash: number; detail: string };
export type PlanField = "goal" | "account" | "monthly" | "mix" | "rule";

export type Action = {
  id: string;
  label: string;
  how: string[];
  link?: { title: string; url: string };
  planField?: PlanField;                     // ticked when this part of the plan is saved
  widget?: "goal" | "fees" | "mix" | "account" | "monthly" | "rule";
  options?: MixOption[];                     // example mixes (widget "mix")
  later?: boolean;                           // real-world task: not needed to finish the step, listed in My Plan
  auto?: "demo";                             // ticks itself (when a demo client is connected)
  page?: string;                             // button to another page
  pageLabel?: string;
};

export type Variant = { lead?: string; topicsFirst?: string[]; suggest?: string };

export type Step = {
  id: string;
  title: string;
  why: string;
  topics: string[];
  lead?: string;
  suggest?: string;
  variants?: Record<string, Variant>;        // key = exact quiz answer text
  moveAfter?: { answer: string; step: string };
  terms?: TermDef[];
  check: CheckQuestion[];
  doIt: Action[];
  coachPrompts: string[];
};

const ALL_STEPS = data.steps as unknown as Step[];

// The quiz answers saved by the onboarding quiz (App.tsx).
export function readQuizAnswers(): string[] {
  return readActiveProfile()?.requiredAnswers ?? [];
}

// The steps in this user's order (a step can move earlier, e.g. "Staying calm" for crypto holders).
export function getSteps(answers: string[]): Step[] {
  const steps = [...ALL_STEPS];
  for (const step of ALL_STEPS) {
    if (!step.moveAfter || !answers.includes(step.moveAfter.answer)) continue;
    steps.splice(steps.indexOf(step), 1);
    const target = steps.findIndex((s) => s.id === step.moveAfter!.step);
    steps.splice(target + 1, 0, step);
  }
  return steps;
}

// The step's intro line, lesson order and suggestion for this user's quiz answers.
export function personalize(step: Step, answers: string[]) {
  const matches = Object.entries(step.variants ?? {})
    .filter(([answer]) => answers.includes(answer))
    .map(([, variant]) => variant);
  const first = matches.flatMap((v) => v.topicsFirst ?? []);
  return {
    lead: matches.find((v) => v.lead)?.lead ?? step.lead,
    topics: [...new Set([...first, ...step.topics])],
    suggest: matches.find((v) => v.suggest)?.suggest ?? step.suggest,
  };
}

// "I'm experienced with investing": can unlock a step by passing its checkpoint alone.
export function isExpert(answers: string[]): boolean {
  return answers[0] === "I'm experienced with investing";
}

// ---------- saved state ----------

export type Plan = {
  goal?: { label: string; amount: number; date: string };
  account?: string;
  monthly?: { amount: number; day: number };
  mix?: { stocks: number; bonds: number; cash: number };
  rule?: string;
  lastCheckIn?: string;   // dates are "YYYY-MM-DD"
  nextCheckIn?: string;
};

export type BabyState = {
  completedSteps: string[];
  currentStep: string;             // id of the first unfinished step, or "finished"
  checks: Record<string, boolean>; // step id -> checkpoint passed
  doneActions: string[];
  plan: Plan;
};

const KEY = "financeBabySteps";
export const FINISHED = "finished";

function emptyState(): BabyState {
  return { completedSteps: [], currentStep: ALL_STEPS[0].id, checks: {}, doneActions: [], plan: {} };
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function oneMonthFrom(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(y, m, Math.min(d, 28));
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function checkPassed(step: Step, state: BabyState): boolean {
  return step.check.length === 0 || state.checks[step.id] === true;
}

function stepComplete(step: Step, state: BabyState, expert: boolean): boolean {
  if (!checkPassed(step, state)) return false;
  if (expert && step.check.length > 0) return true; // "test out"
  return step.doIt.filter((a) => !a.later).every((a) => state.doneActions.includes(a.id));
}

// Works out which steps are complete, in order. A finished step stays finished.
function sync(state: BabyState): BabyState {
  const answers = readQuizAnswers();
  const steps = getSteps(answers);
  const expert = isExpert(answers);
  const completed = state.completedSteps.filter((id) => steps.some((s) => s.id === id));
  for (const step of steps) {
    if (completed.includes(step.id)) continue;
    if (!stepComplete(step, state, expert)) break;
    completed.push(step.id);
  }
  const current = steps.find((s) => !completed.includes(s.id));
  const plan = { ...state.plan };
  if (!current && !plan.nextCheckIn) plan.nextCheckIn = oneMonthFrom(todayISO());
  return { ...state, completedSteps: completed, currentStep: current ? current.id : FINISHED, plan };
}

function load(): BabyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const saved = JSON.parse(raw) as Partial<BabyState> | null;
    if (!saved || typeof saved !== "object") return emptyState();
    return sync({
      completedSteps: Array.isArray(saved.completedSteps) ? saved.completedSteps : [],
      currentStep: typeof saved.currentStep === "string" ? saved.currentStep : ALL_STEPS[0].id,
      checks: saved.checks && typeof saved.checks === "object" ? saved.checks : {},
      doneActions: Array.isArray(saved.doneActions) ? saved.doneActions : [],
      plan: saved.plan && typeof saved.plan === "object" ? saved.plan : {},
    });
  } catch {
    return emptyState();
  }
}

let state: BabyState = load();
const listeners = new Set<() => void>();

function update(change: (s: BabyState) => BabyState) {
  state = sync(change(state));
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked (private mode): progress still works until the page is closed
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- actions ----------

export function passCheck(stepId: string) {
  update((s) => ({ ...s, checks: { ...s.checks, [stepId]: true } }));
}

export function setActionDone(actionId: string, done: boolean) {
  update((s) => ({
    ...s,
    doneActions: done
      ? [...new Set([...s.doneActions, actionId])]
      : s.doneActions.filter((id) => id !== actionId),
  }));
}

// A demo client was connected on the Portfolio page: ticks the actions that wait for it.
export function markDemoConnected() {
  const ids = ALL_STEPS.flatMap((s) => s.doIt.filter((a) => a.auto === "demo").map((a) => a.id));
  update((s) => ({ ...s, doneActions: [...new Set([...s.doneActions, ...ids])] }));
}

// Saves part of the plan and, when it comes from a Do it card, ticks that card.
export function savePlan(patch: Partial<Plan>, actionId?: string) {
  update((s) => ({
    ...s,
    plan: { ...s.plan, ...patch },
    doneActions: actionId ? [...new Set([...s.doneActions, actionId])] : s.doneActions,
  }));
}

export function completeCheckIn() {
  const today = todayISO();
  savePlan({ lastCheckIn: today, nextCheckIn: oneMonthFrom(today) });
}

// A new sign-up starts from scratch (main.tsx), like the quiz answers.
export function resetBabySteps() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to remove
  }
  state = emptyState();
  listeners.forEach((listener) => listener());
}

export function useBabySteps() {
  const current = useSyncExternalStore(subscribe, () => state, () => state);
  return { state: current, passCheck, setActionDone, savePlan, completeCheckIn };
}

// ---------- "what's next?" (Home card and the chatbot) ----------

export type NextThing =
  | { kind: "step"; step: Step; number: number; total: number; action: string }
  | { kind: "checkin"; date?: string };

export function nextThing(s: BabyState, steps: Step[]): NextThing {
  const index = steps.findIndex((step) => !s.completedSteps.includes(step.id));
  if (index < 0) return { kind: "checkin", date: s.plan.nextCheckIn };
  const step = steps[index];
  const todo = step.doIt.find((a) => !a.later && !s.doneActions.includes(a.id));
  const action = !checkPassed(step, s)
    ? "Read the lessons and pass the quick check"
    : (todo?.label ?? "Finish this step");
  return { kind: "step", step, number: index + 1, total: steps.length, action };
}

export type StepInfo = { id: string; title: string; number: number; total: number };

// What the chatbot is told about the user's progress (sent in the chat `context`).
// `openStep` is the step open on the Baby Steps page, if any; otherwise the next unfinished one.
export function coachContext(s: BabyState, answers: string[], openStep?: StepInfo | null) {
  const next = nextThing(s, getSteps(answers));
  const step: StepInfo | null =
    openStep ??
    (next.kind === "step"
      ? { id: next.step.id, title: next.step.title, number: next.number, total: next.total }
      : null);
  const nextAction =
    next.kind === "step"
      ? `Baby Step ${next.number} of ${next.total} (${next.step.title}): ${next.action}`
      : `All Baby Steps are finished. Next monthly check-in on the My Plan page${next.date ? `: ${next.date}` : ""}`;
  return { step, plan: s.plan, completedSteps: s.completedSteps, nextAction };
}

// The start of the "rule for myself" sentence (Baby Step "Staying calm"); plan.rule holds the ending.
export const RULE_PREFIX = "If my portfolio drops 20%, I will";
