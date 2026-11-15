// The 30-second monthly check-in on My Plan: two questions, then the next check-in date is saved.
// If the market is worrying the user, their own "rule for myself" is shown back to them.
import { useState } from "react";
import LessonLinks from "./LessonLinks";
import { RULE_PREFIX, completeCheckIn, formatDate, todayISO } from "./babyStepsStore";
import type { Plan } from "./babyStepsStore";
import type { Level } from "./learningLevel";

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
          <strong>Check-in done. See you next month!</strong> Your next check-in is on{" "}
          {formatDate(plan.nextCheckIn)}.
        </p>
      </div>
    );
  }

  return (
    <div className="plan-checkin">
      <p className="plan-checkin-dates">
        {plan.lastCheckIn ? `Last check-in: ${formatDate(plan.lastCheckIn)}. ` : "You haven't done a check-in yet. "}
        {plan.nextCheckIn && (due ? "Your check-in is due now." : `Next one: ${formatDate(plan.nextCheckIn)}.`)}
      </p>

      <Question label="Did your contribution go through?" options={CONTRIBUTION} value={went} onChange={setWent} />
      {went === "No" && (
        <p className="plan-tip">
          It happens. Check that the money was in your bank account on the day, then look at your
          automatic contribution in your online banking, or ask your bank.
        </p>
      )}
      {went === "I haven't set it up yet" && (
        <p className="plan-tip">No rush. It is on your "This week" list above whenever you are ready.</p>
      )}

      <Question label="Anything worrying you?" options={WORRIES} value={worry} onChange={setWorry} />
      {worry === "The market scares me" && (
        <div className="plan-tip">
          {plan.rule ? (
            <>
              <p>That is normal. Here is the rule you wrote for yourself on a calm day:</p>
              <blockquote className="plan-rule">
                {RULE_PREFIX} {plan.rule}
              </blockquote>
            </>
          ) : (
            <p>That is normal. Drops are part of investing, and this lesson explains what they are.</p>
          )}
          <LessonLinks topics={["volatility"]} level={level} onNavigate={onNavigate} />
        </div>
      )}
      {worry === "I'm not sure my plan still fits" && (
        <div className="plan-tip">
          <p>
            Plans are allowed to change. Have another look at your goal, timeline and risk, or talk
            it through with an advisor at your bank.
          </p>
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
