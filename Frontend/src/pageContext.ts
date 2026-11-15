// What the user is looking at right now, so the AI Phone can answer "explain this".
// App.tsx reports the page; TopicSlides.tsx reports the open lesson and slide.
// The AI Phone reads it (usePageContext) and sends it with each question.
import { useSyncExternalStore } from "react";

export type Lesson = {
  id: string;        // topic id, e.g. "etf"
  topic: string;     // "ETFs"
  slide: string;     // "Example"
  content: string;   // the text on that slide
};

export type PageContext = { page: string; lesson: Lesson | null };

let snapshot: PageContext = { page: "", lesson: null };
const listeners = new Set<() => void>();

function update(next: Partial<PageContext>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

export function setCurrentPage(page: string) {
  if (page !== snapshot.page) update({ page });
}

// The most recently opened or changed lesson slide wins.
export function setCurrentLesson(lesson: Lesson) {
  update({ lesson });
}

// Called when a lesson closes; ignored if another lesson has taken over since.
export function clearCurrentLesson(id: string) {
  if (snapshot.lesson?.id === id) update({ lesson: null });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePageContext(): PageContext {
  return useSyncExternalStore(subscribe, () => snapshot);
}
