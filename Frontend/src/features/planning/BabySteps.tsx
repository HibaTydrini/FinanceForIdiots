// "Baby Steps": a guided path for complete beginners, about investing only.
//
// The path lives in src/data/babySteps.json. Each step links to its lessons from
// data/learningPath.json (they open on the Learn page, "#dashboard/learning/<topic id>"), then asks a
// few checkpoint questions, then gives "Do it" actions. Progress and the plan are saved by
// babyStepsStore.ts. A step is complete when its checkpoint is passed and its actions are ticked.

import { useEffect, useMemo, useRef, useState } from "react";
import "./BabySteps.css";
import ActionCard from "./ActionCard";
import Icon from "../../shared/Icon";
import LessonLinks from "../learning/LessonLinks";
import PlanWidget from "./PlanWidgets";
import RichText from "../../shared/RichText";
import { checkPassed, getSteps, isExpert, passCheck, personalize, setActionDone, useBabySteps } from "./babyStepsStore";
import type { Action, BabyState, Step } from "./babyStepsStore";
import { levelFromKnowledge } from "../learning/learningLevel";
import type { Level } from "../learning/learningLevel";
import { clearCurrentStep, setCurrentStep } from "../../app/pageContext";
import data from "../../data/babySteps.json";

type Props = {
  answers: string[]; // onboarding quiz answers (App.tsx)
  onNavigate: (page: string) => void;
  // Opens the AI Coach with this question filled in.
  onAskCoach: (question: string) => void;
};

// Every step is open: "current" is just the first one not done yet (the suggested next step).
type Status = "done" | "current" | "todo";
const STATUS_LABEL: Record<Status, string> = { done: "Done", current: "Up next", todo: "Not started" };

export default function BabySteps({ answers, onNavigate, onAskCoach }: Props) {
  const { state } = useBabySteps();
  const steps = useMemo(() => getSteps(answers), [answers]);
  const level = levelFromKnowledge(answers[0]);
  const expert = isExpert(answers);

  const currentIndex = steps.findIndex((s) => s.id === state.currentStep);
  const total = steps.length;
  const doneCount = state.completedSteps.length;
  const statusOf = (index: number): Status =>
    state.completedSteps.includes(steps[index].id) ? "done" : index === currentIndex ? "current" : "todo";

  // The step shown in the panel: the current one, or the last one once everything is done.
  const [openId, setOpenId] = useState<string>(steps[currentIndex >= 0 ? currentIndex : total - 1]?.id ?? "");
  const openIndex = Math.max(0, steps.findIndex((s) => s.id === openId));
  const open = steps[openIndex];
  const openStatus = statusOf(openIndex);
  const prev = openIndex > 0 ? openIndex - 1 : null;
  const next = openIndex < total - 1 ? openIndex + 1 : null;
  const panelRef = useRef<HTMLElement>(null);

  // Tell the AI Phone which Baby Step is open (pageContext.ts).
  useEffect(() => {
    if (!open) return;
    setCurrentStep({ id: open.id, title: open.title, number: openIndex + 1, total });
    return () => clearCurrentStep(open.id);
  }, [open, openIndex, total]);

  function show(index: number) {
    setOpenId(steps[index].id);
    // on small screens the panel is below the step list: bring its top into view
    const top = panelRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!open) return null;

  return (
    <div className="bs">
      <div className="bs-layout">
        <nav className="bs-nav" aria-label="Baby Steps">
          <div className="bs-nav-progress">
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
          </div>
          <ol className="bs-nav-list">
            {steps.map((step, index) => {
              const status = statusOf(index);
              const selected = index === openIndex;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`bs-nav-item ${status} ${selected ? "selected" : ""}`}
                    aria-current={selected ? "step" : undefined}
                    aria-label={`Step ${index + 1}: ${step.title} (${STATUS_LABEL[status]})`}
                    title={step.title}
                    onClick={() => show(index)}
                  >
                    <span className="bs-marker" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="bs-nav-title">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <article className={`bs-panel ${openStatus}`} ref={panelRef} key={open.id}>
          {openStatus !== "todo" && (
            <p className="bs-panel-eyebrow">
              <span className={`bs-status ${openStatus}`}>{STATUS_LABEL[openStatus]}</span>
            </p>
          )}
          <h2>{open.title}</h2>
          <p className="bs-panel-why">{open.why}</p>

          <StepBody
            step={open}
            answers={answers}
            level={level}
            expert={expert}
            state={state}
            onNavigate={onNavigate}
            onAskCoach={onAskCoach}
          />

          <div className="bs-panel-foot">
            {prev !== null ? (
              <button type="button" className="bs-step-nav" onClick={() => show(prev)}>
                ← {steps[prev].title}
              </button>
            ) : (
              <span />
            )}
            {next !== null ? (
              <button
                type="button"
                className={openStatus === "done" ? "primary" : "bs-step-nav"}
                onClick={() => show(next)}
              >
                Next: {steps[next].title} →
              </button>
            ) : (
              openStatus === "done" && (
                <button type="button" className="primary" onClick={() => onNavigate("plan")}>
                  Go to My Plan →
                </button>
              )
            )}
          </div>
        </article>
      </div>

      <p className="disclaimer">{data.disclaimer}</p>
    </div>
  );
}

type BodyProps = {
  step: Step;
  answers: string[];
  level: Level;
  expert: boolean;
  state: BabyState;
  onNavigate: (page: string) => void;
  onAskCoach: (question: string) => void;
};

function StepBody({ step, answers, level, expert, state, onNavigate, onAskCoach }: BodyProps) {
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
      {view.topics.length > 0 && (
        <section>
          <h3>1. Learn</h3>
          <LessonLinks
            topics={view.topics}
            level={level}
            onOpenLesson={(id) => onNavigate(`learning/${id}`)}
          />
        </section>
      )}

      {step.check.length > 0 && (
        <section>
          <h3>2. Quick check</h3>
          {testOut && !complete && (
            <p className="bs-note">Pass this to finish the step. Do it is optional for you.</p>
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
                  <p className="bs-note">This happens at your bank, so it can wait. It isn't needed to finish this step.</p>
                )}
                {action.widget && <PlanWidget action={action} plan={state.plan} suggest={view.suggest} />}
              </ActionCard>
            ))}
          </ul>
        </section>
      )}

      {step.coachPrompts.length > 0 && (
        <section>
          <div className="bs-prompts">
            <span className="bs-prompts-label">Ask the coach:</span>
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
