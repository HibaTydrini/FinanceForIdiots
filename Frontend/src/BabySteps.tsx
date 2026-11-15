// "Baby Steps": a guided path for complete beginners, about investing only.
//
// The path lives in src/data/babySteps.json. Each step re-uses lessons from
// data/learningPath.json (shown with the same TopicSlides as the Learning Path), then asks a
// few checkpoint questions, then gives "Do it" actions. Progress and the plan are saved by
// babyStepsStore.ts. A step is complete when its checkpoint is passed and its actions are ticked.

import { useEffect, useMemo, useState } from "react";
import "./BabySteps.css";
import ActionCard from "./ActionCard";
import Icon from "./Icon";
import LessonLinks from "./LessonLinks";
import PlanWidget from "./PlanWidgets";
import RichText from "./RichText";
import { checkPassed, getSteps, isExpert, passCheck, personalize, setActionDone, useBabySteps } from "./babyStepsStore";
import type { Action, BabyState, Step } from "./babyStepsStore";
import { levelFromKnowledge } from "./learningLevel";
import type { Level } from "./learningLevel";
import { clearCurrentStep, setCurrentStep } from "./pageContext";
import data from "./data/babySteps.json";

type Props = {
  answers: string[]; // onboarding quiz answers (App.tsx)
  onNavigate: (page: string) => void;
  // Opens the AI Coach with this question filled in.
  onAskCoach: (question: string) => void;
};

type Status = "done" | "current" | "locked";
const STATUS_LABEL: Record<Status, string> = { done: "Done", current: "Current step", locked: "Locked" };

export default function BabySteps({ answers, onNavigate, onAskCoach }: Props) {
  const { state } = useBabySteps();
  const steps = useMemo(() => getSteps(answers), [answers]);
  const level = levelFromKnowledge(answers[0]);
  const expert = isExpert(answers);

  const currentIndex = steps.findIndex((s) => s.id === state.currentStep);
  const [openId, setOpenId] = useState<string | null>(currentIndex >= 0 ? state.currentStep : null);
  const openIndex = steps.findIndex((s) => s.id === openId);
  const openTitle = openIndex >= 0 ? steps[openIndex].title : "";
  const total = steps.length;
  const doneCount = state.completedSteps.length;

  // Tell the AI Phone which Baby Step is open (pageContext.ts).
  useEffect(() => {
    if (!openId || openIndex < 0) return;
    setCurrentStep({ id: openId, title: openTitle, number: openIndex + 1, total });
    return () => clearCurrentStep(openId);
  }, [openId, openIndex, openTitle, total]);

  return (
    <div className="bs">
      <div className="progress-label">
        <span>Your Baby Steps</span>
        {currentIndex >= 0 ? `Step ${currentIndex + 1} of ${total}` : `All ${total} steps done`}
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Baby Steps completed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={doneCount}
      >
        <div style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>

      <ol className="bs-road">
        {steps.map((step, index) => {
          const done = state.completedSteps.includes(step.id);
          const status: Status = done ? "done" : index === currentIndex ? "current" : "locked";
          const isOpen = openId === step.id;
          return (
            <li key={step.id} className={`bs-step ${status} ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="bs-step-head"
                aria-expanded={isOpen}
                aria-current={status === "current" ? "step" : undefined}
                aria-disabled={status === "locked"}
                title={status === "locked" ? "Finish the steps before this one to unlock it" : undefined}
                onClick={() => {
                  if (status !== "locked") setOpenId(isOpen ? null : step.id);
                }}
              >
                <span className="bs-marker" aria-hidden="true">
                  {done ? <Icon name="done" size={22} /> : index + 1}
                </span>
                <span className="bs-step-text">
                  <strong>{step.title}</strong>
                  <span>{step.why}</span>
                </span>
                <span className="bs-status">{STATUS_LABEL[status]}</span>
                {status !== "locked" && <span className="toc-chevron" aria-hidden="true" />}
              </button>

              {isOpen && (
                <StepBody
                  step={step}
                  next={steps[index + 1]}
                  answers={answers}
                  level={level}
                  expert={expert}
                  state={state}
                  onNavigate={onNavigate}
                  onAskCoach={onAskCoach}
                  onOpen={setOpenId}
                />
              )}
            </li>
          );
        })}
      </ol>

      <p className="disclaimer">{data.disclaimer}</p>
    </div>
  );
}

type BodyProps = {
  step: Step;
  next?: Step;
  answers: string[];
  level: Level;
  expert: boolean;
  state: BabyState;
  onNavigate: (page: string) => void;
  onAskCoach: (question: string) => void;
  onOpen: (id: string) => void;
};

function StepBody({ step, next, answers, level, expert, state, onNavigate, onAskCoach, onOpen }: BodyProps) {
  const view = personalize(step, answers);
  const complete = state.completedSteps.includes(step.id);
  const testOut = expert && step.check.length > 0;

  function toggle(action: Action): string | undefined {
    if (state.doneActions.includes(action.id)) {
      setActionDone(action.id, false);
      return undefined;
    }
    if (action.auto) return "This one ticks itself when you connect a demo client.";
    if (action.planField && state.plan[action.planField] === undefined) {
      return "Fill this in and save it to your plan to tick it off.";
    }
    setActionDone(action.id, true);
    return undefined;
  }

  function go(action: Action, page: string) {
    if (!action.auto) setActionDone(action.id, true);
    onNavigate(page);
  }

  const firstTodo = step.doIt.find((a) => !state.doneActions.includes(a.id));

  return (
    <div className="bs-body">
      {view.lead && <p className="bs-lead">{view.lead}</p>}
      <p className="bs-why">
        <strong>Why this matters: </strong>
        <RichText text={step.why} terms={step.terms} />
      </p>

      {view.topics.length > 0 && (
        <section>
          <h3>1. Learn</h3>
          <LessonLinks topics={view.topics} level={level} openFirst={!complete} onNavigate={onNavigate} />
        </section>
      )}

      {step.check.length > 0 && (
        <section>
          <h3>2. Quick check</h3>
          {testOut && !complete && (
            <p className="bs-note">
              You said you are experienced with investing: pass this check to unlock the next step. The
              Do it actions are optional for you.
            </p>
          )}
          <Checkpoint step={step} passed={checkPassed(step, state)} />
        </section>
      )}

      {step.doIt.length > 0 && (
        <section>
          <h3>{step.check.length > 0 ? "3. Do it" : "Do it"}</h3>
          <ul className="bs-actions">
            {step.doIt.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                done={state.doneActions.includes(action.id)}
                onToggle={() => toggle(action)}
                terms={step.terms}
                defaultOpen={action.id === firstTodo?.id}
                onGo={(page) => go(action, page)}
              >
                {action.later && (
                  <p className="bs-note">
                    This one happens at your bank, so it can wait: it is not needed to finish this step.
                    It stays on My Plan until you tick it.
                  </p>
                )}
                {action.widget && <PlanWidget action={action} plan={state.plan} suggest={view.suggest} />}
              </ActionCard>
            ))}
          </ul>
        </section>
      )}

      {step.coachPrompts.length > 0 && (
        <section>
          <h3>Ask the AI Coach</h3>
          <div className="bs-prompts">
            {step.coachPrompts.map((prompt) => (
              <button type="button" key={prompt} className="bs-chip" onClick={() => onAskCoach(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </section>
      )}

      {complete && (
        <div className="bs-complete" role="status">
          <strong>Step complete. Nice work!</strong>
          {next ? (
            <button type="button" className="primary" onClick={() => onOpen(next.id)}>
              Next: {next.title} →
            </button>
          ) : (
            <button type="button" className="primary" onClick={() => onNavigate("plan")}>
              Go to My Plan →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Checkpoint questions with instant feedback. Passed once every question is answered correctly.
function Checkpoint({ step, passed }: { step: Step; passed: boolean }) {
  const [picks, setPicks] = useState<Record<number, number>>({});

  function pick(question: number, option: number) {
    const updated = { ...picks, [question]: option };
    setPicks(updated);
    if (!passed && step.check.every((c, i) => updated[i] === c.answer)) passCheck(step.id);
  }

  return (
    <div className="bs-check">
      {passed && (
        <p className="bs-passed" role="status">
          <Icon name="done" size={18} /> Checkpoint passed
        </p>
      )}
      <ol className="bs-questions">
        {step.check.map((c, i) => {
          const picked = picks[i];
          const answered = picked !== undefined;
          const correct = picked === c.answer;
          return (
            <li key={c.q}>
              <p className="bs-question">{c.q}</p>
              <div className="bs-options" role="group" aria-label={c.q}>
                {c.options.map((option, k) => (
                  <button
                    type="button"
                    key={option}
                    className={`answer ${picked === k ? (correct ? "selected right" : "selected wrong") : ""}`}
                    aria-pressed={picked === k}
                    onClick={() => pick(i, k)}
                  >
                    <span className="radio-dot" />
                    {option}
                  </button>
                ))}
              </div>
              {answered && (
                <p className={`bs-feedback ${correct ? "right" : "wrong"}`} role="status">
                  {correct ? (
                    <RichText text={c.explain} terms={step.terms} />
                  ) : (
                    "Not quite. Have another look at the lesson and try again."
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
