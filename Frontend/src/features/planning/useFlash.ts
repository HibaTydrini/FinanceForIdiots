// A short status message ("Sent", "Could not save") that replaces the previous one and clears
// itself after a few seconds. Used by the email and Google Calendar boxes on My Plan.
import { useEffect, useRef, useState } from "react";

export type Flash = { kind: "ok" | "error"; text: string } | null;

const SHOW_MS = 6000;

export function useFlash(): [Flash, (next: Flash) => void] {
  const [flash, setFlash] = useState<Flash>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function show(next: Flash) {
    window.clearTimeout(timer.current);
    setFlash(next);
    if (next) timer.current = window.setTimeout(() => setFlash(null), SHOW_MS);
  }

  return [flash, show];
}
