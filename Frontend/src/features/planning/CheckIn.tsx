// The 30-second monthly check-in on My Plan: two questions, then the next check-in date is saved.
// If the market is worrying the user, their own "rule for myself" is shown back to them.
import { useState } from "react";
import LessonLinks from "../learning/LessonLinks";
import { RULE_PREFIX, completeCheckIn, formatDate, todayISO } from "./babyStepsStore";
import type { Plan } from "./babyStepsStore";
import type { Level } from "../learning/learningLevel";

type Props = {
  plan: Plan;
  level: Level;
  onNavigate: (page: string) => void;
};

const CONTRIBUTION = ["Yes", "No", "I haven't set it up yet"];
const WORRIES = ["No, all good", "The market scares me", "I'm not sure my plan still fits"];

export default function CheckIn({ plan, level, onNavigate }: Props) {
  const [today] = useState(todayISO);
  const [went, setWent] = useState("");
  const [worry, setWorry] = useState("");
  const [finished, setFinished] = useState(false);

  const due = plan.nextCheckIn !== undefined && plan.nextCheckIn <= today;

  if (finished) {
    return (
      <div className="plan-checkin" role="status">
        <p className="plan-checkin-done">
          <strong>Done. See you next month!</strong> Next: {formatDate(plan.nextCheckIn)}.
        </p>
      </div>
    );
  }

  return (
    <div className="plan-checkin">
      <p className="plan-checkin-dates">
        30 seconds, once a month.{" "}
        {plan.nextCheckIn && (due ? "Due now." : `Next: ${formatDate(plan.nextCheckIn)}.`)}
      </p>

      <Question label="Did your contribution go through?" options={CONTRIBUTION} value={went} onChange={setWent} />
      {went === "No" && (
        <p className="plan-tip">
          Check the money was in your bank account that day, then look at your automatic contribution or ask
          your bank.
        </p>
      )}
      {went === "I haven't set it up yet" && (
        <p className="plan-tip">No rush. It's on your To do list above.</p>
      )}

      <Question label="Anything worrying you?" options={WORRIES} value={worry} onChange={setWorry} />
      {worry === "The market scares me" && (
        <div className="plan-tip">
          {plan.rule ? (
            <>
              <p>That's normal. Here's the rule you wrote on a calm day:</p>
              <blockquote className="plan-rule">
                {RULE_PREFIX} {plan.rule}
              </blockquote>
            </>
          ) : (
            <p>That's normal. Drops are part of investing.</p>
          )}
          <LessonLinks topics={["volatility"]} level={level} onOpenLesson={(id) => onNavigate(`learning/${id}`)} />
        </div>
      )}
      {worry === "I'm not sure my plan still fits" && (
        <div className="plan-tip">
          <p>Plans can change. Review your goal and risk, or talk to an advisor at your bank.</p>
          <button type="button" className="toc-action" onClick={() => onNavigate("steps")}>
            Review my Baby Steps
          </button>
        </div>
      )}

      <button
        type="button"
        className="primary"
        disabled={!went || !worry}
        onClick={() => {
          completeCheckIn();
          setFinished(true);
        }}
      >
        Finish check-in
      </button>
    </div>
  );
}

function Question({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="plan-question">
      <p>{label}</p>
      <div className="plan-options" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={`bs-chip ${value === option ? "selected" : ""}`}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
