// One "Do it" action: a tick box, a label, and an expandable "How" with instructions.
// Used by Baby Steps and by the to-do lists on My Plan.
import { useState } from "react";
import type { ReactNode } from "react";
import RichText from "../../shared/RichText";
import type { TermDef } from "../../shared/RichText";
import type { Action } from "./babyStepsStore";

type Props = {
  action: Action;
  done: boolean;
  // Ticks or unticks the action. Returns a short message when it can't be ticked yet.
  onToggle: () => string | undefined;
  terms?: TermDef[];
  defaultOpen?: boolean;
  // Called by the action's page button (e.g. "Go to My Plan").
  onGo?: (page: string) => void;
  children?: ReactNode; // the action's widget (goal card, calculator...)
};

export default function ActionCard({ action, done, onToggle, terms, defaultOpen = false, onGo, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [hint, setHint] = useState("");

  function tick() {
    const message = onToggle();
    setHint(message ?? "");
    if (message) setOpen(true);
  }

  return (
    <li className={`bs-action ${done ? "done" : ""}`}>
      <button
        type="button"
        className="bs-tick"
        role="checkbox"
        aria-checked={done}
        aria-label={`Done: ${action.label}`}
        onClick={tick}
      />
      <div className="bs-action-main">
        <button
          type="button"
          className="bs-action-head"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <strong>{action.label}</strong>
          <span className="bs-how-label">{open ? "Hide" : "How"}</span>
          <span className="toc-chevron" aria-hidden="true" />
        </button>

        {open && (
          <div className="bs-action-body">
            <ol className="bs-how">
              {action.how.map((line) => (
                <li key={line}>
                  <RichText text={line} terms={terms} />
                </li>
              ))}
            </ol>

            {children}

            {hint && !done && (
              <p className="bs-hint" role="status">
                {hint}
              </p>
            )}

            {(action.page || action.link) && (
              <div className="bs-action-foot">
                {action.page && onGo && (
                  <button type="button" className="toc-action filled" onClick={() => onGo(action.page!)}>
                    {action.pageLabel ?? "Open"} →
                  </button>
                )}
                {action.link && (
                  <p className="toc-sources">
                    Read more:{" "}
                    <a href={action.link.url} target="_blank" rel="noopener noreferrer">
                      {action.link.title}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
