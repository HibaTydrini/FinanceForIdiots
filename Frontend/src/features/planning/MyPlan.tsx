// "My Plan": the long-term plan built in Baby Steps, and what to do next.
// The plan itself is saved by babyStepsStore.ts. Below it: To do (setup at the bank, first contribution),
// Stay on track (monthly check-in, weekly email, Google Calendar) and Later (every year, life changes,
// Level 2). Lessons are links to the Learn page.
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import "./BabySteps.css";
import "./MyPlan.css";
import ActionCard from "./ActionCard";
import CheckIn from "./CheckIn";
import LessonLinks from "../learning/LessonLinks";
import { MixBar } from "./PlanWidgets";
import { RULE_PREFIX, formatDate, getSteps, setActionDone, todayISO, useBabySteps } from "./babyStepsStore";
import type { Action, PlanField, Step } from "./babyStepsStore";
import { levelFromKnowledge } from "../learning/learningLevel";
import { topicById } from "../learning/lessons";
import CalendarBox from "./CalendarBox";
import EmailCheckinBox from "./EmailCheckinBox";
import { money, monthlyNeeded, monthsUntil } from "./planMath";

type Props = {
  answers: string[]; // onboarding quiz answers (App.tsx)
  onNavigate: (page: string) => void;
};

// To-dos that only exist on this page (ticks are saved with the Baby Steps actions).
const THIS_MONTH: Action[] = [
  {
    id: "plan-first-contribution",
    label: "Make your first contribution",
    how: [
      "If you set up an automatic contribution, it happens by itself on the day you chose.",
      "If not, move the amount from your plan yourself in your online banking.",
    ],
  },
  {
    id: "plan-check-arrived",
    label: "Check that it arrived",
    how: ["A few days later, log in to your investment account and check the amount matches your plan."],
  },
];

const YEARLY: Item[] = [
  { title: "Check your mix", text: "Some investments grow faster than others, so your mix drifts.", topics: ["rebalancing"] },
  { title: "Check your contribution room", text: "New TFSA room is added each January. See your CRA My Account.", topics: ["registered_accounts"] },
  { title: "Look at your goal again", text: "Is the amount or the date still right?", topics: ["goals_horizon"] },
];

const LIFE_CHANGES: Item[] = [
  { title: "A new job or a raise", text: "Look at your monthly amount again, and ask about savings plans at work.", topics: ["dollar_cost_averaging"] },
  { title: "Moving", text: "Give your bank your new address. Another province or country can change your taxes.", topics: ["investment_taxes"] },
  { title: "Buying a home", text: "As the date gets closer, the money for it usually needs less risk.", topics: ["goals_horizon", "gics"] },
  { title: "A big market drop", text: "Drops are normal. Read your rule before you change anything.", topics: ["volatility"], showRule: true },
];

const LEVEL_2 = ["rebalancing", "research", "market_index", "bull_bear", "investment_taxes"];

export default function MyPlan({ answers, onNavigate }: Props) {
  const { state } = useBabySteps();
  const [today] = useState(todayISO);
  const steps = useMemo(() => getSteps(answers), [answers]);
  const level = levelFromKnowledge(answers[0]);
  const { plan } = state;
  const openLesson = (id: string) => onNavigate(`learning/${id}`);

  const finished = steps.every((s) => state.completedSteps.includes(s.id));
  const stepsLeft = steps.length - state.completedSteps.length;
  // One to-do list: setup at the bank from the steps (open the account, automatic contribution),
  // then this month's first contribution.
  const todos = [
    ...steps.flatMap((s) => s.doIt.filter((a) => a.later).map((action) => ({ action, terms: s.terms }))),
    ...THIS_MONTH.map((action) => ({ action, terms: undefined })),
  ];
  const todosLeft = todos.filter(({ action }) => !state.doneActions.includes(action.id));
  const firstTodo = todosLeft[0]?.action.id;

  const goalMonths = plan.goal && plan.goal.date > today ? monthsUntil(plan.goal.date, today) : null;

  function toggle(action: Action) {
    setActionDone(action.id, !state.doneActions.includes(action.id));
    return undefined;
  }

  return (
    <div className="plan">
      {!finished && (
        <div className="plan-banner">
          <span>
            {stepsLeft} Baby {stepsLeft === 1 ? "Step" : "Steps"} left to finish your plan.
          </span>
          <button type="button" className="primary" onClick={() => onNavigate("steps")}>
            Continue Baby Steps →
          </button>
        </div>
      )}

      {/* ---------- the saved plan ---------- */}
      <div className="plan-grid">
        <PlanCard title="Goal" field="goal" steps={steps} filled={plan.goal !== undefined} onNavigate={onNavigate}>
          {plan.goal && (
            <>
              <strong>{plan.goal.label}</strong>
              <span>
                {money(plan.goal.amount)} by {formatDate(plan.goal.date)}
              </span>
              {goalMonths !== null && (
                <span className="plan-small">≈ {money(monthlyNeeded(plan.goal.amount, goalMonths))} a month</span>
              )}
            </>
          )}
        </PlanCard>

        <PlanCard title="Account" field="account" steps={steps} filled={plan.account !== undefined} onNavigate={onNavigate}>
          <strong>{plan.account}</strong>
        </PlanCard>

        <PlanCard title="Monthly" field="monthly" steps={steps} filled={plan.monthly !== undefined} onNavigate={onNavigate}>
          {plan.monthly && (
            <>
              <strong>{money(plan.monthly.amount)}</strong>
              <span>On day {plan.monthly.day} of each month</span>
            </>
          )}
        </PlanCard>

        <PlanCard title="Example mix" field="mix" steps={steps} filled={plan.mix !== undefined} onNavigate={onNavigate}>
          {plan.mix && (
            <>
              <MixBar mix={plan.mix} />
              <span>
                {plan.mix.stocks}% stocks · {plan.mix.bonds}% bonds · {plan.mix.cash}% cash
              </span>
            </>
          )}
        </PlanCard>

        <PlanCard title="My rule" field="rule" steps={steps} filled={plan.rule !== undefined} onNavigate={onNavigate} wide>
          <blockquote className="plan-rule">
            {RULE_PREFIX} {plan.rule}
          </blockquote>
        </PlanCard>
      </div>

      {/* ---------- to do ---------- */}
      <Section title="To do">
        {todosLeft.length === 0 ? (
          <p className="plan-text">All done. Nice work!</p>
        ) : (
          <ul className="bs-actions">
            {todosLeft.map(({ action, terms }) => (
              <ActionCard
                key={action.id}
                action={action}
                done={false}
                onToggle={() => toggle(action)}
                terms={terms}
                defaultOpen={action.id === firstTodo}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* ---------- staying on track ---------- */}
      <Section title="Stay on track">
        <div className="plan-track">
          <div className="plan-box wide" id="check-in">
            <h3>Monthly check-in</h3>
            <CheckIn plan={plan} level={level} onNavigate={onNavigate} />
          </div>
          <div className="plan-box">
            <h3>Weekly email</h3>
            <EmailCheckinBox />
          </div>
          <div className="plan-box">
            <h3>Google Calendar</h3>
            <CalendarBox onNavigate={onNavigate} />
          </div>
        </div>
      </Section>

      {/* ---------- later ---------- */}
      <Section title="Later">
        <div className="plan-later">
          <Group title="Every year" items={YEARLY} onOpenLesson={openLesson} />
          <Group
            title="When life changes"
            items={LIFE_CHANGES}
            onOpenLesson={openLesson}
            rule={plan.rule ? `${RULE_PREFIX} ${plan.rule}` : undefined}
          />
          <div className="plan-box">
            <h3>Level 2</h3>
            {finished ? (
              <LessonLinks topics={LEVEL_2} level={level} onOpenLesson={openLesson} />
            ) : (
              <p className="plan-text plan-locked">Unlocks when you finish Baby Steps.</p>
            )}
          </div>
        </div>
      </Section>

      <p className="disclaimer">
        Your plan is educational and is not a formal investment suitability assessment or financial advice.
      </p>
    </div>
  );
}

type Item = { title: string; text: string; topics: string[]; showRule?: boolean };

type GroupProps = { title: string; items: Item[]; rule?: string; onOpenLesson: (id: string) => void };

// A short list of moments; click one to see one line of advice and links to its lessons.
function Group({ title, items, rule, onOpenLesson }: GroupProps) {
  return (
    <div className="plan-box">
      <h3>{title}</h3>
      <div className="plan-items">
        {items.map((item) => (
          <details className="plan-item" key={item.title}>
            <summary>{item.title}</summary>
            <p>{item.text}</p>
            {item.showRule && rule && <blockquote className="plan-rule">{rule}</blockquote>}
            <div className="plan-item-lessons">
              {item.topics.map((id) => (
                <button type="button" key={id} className="plan-link" onClick={() => onOpenLesson(id)}>
                  {topicById(id)?.title ?? id} →
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

type CardProps = {
  title: string;
  field: PlanField;
  steps: Step[];
  filled: boolean;
  wide?: boolean;
  onNavigate: (page: string) => void;
  children: ReactNode;
};

// One part of the plan, or a pointer to the Baby Step that fills it in.
function PlanCard({ title, field, steps, filled, wide, onNavigate, children }: CardProps) {
  const index = steps.findIndex((s) => s.doIt.some((a) => a.planField === field));
  return (
    <div className={`plan-card ${filled ? "" : "empty"} ${wide ? "wide" : ""}`}>
      <p className="plan-card-title">{title}</p>
      {filled ? (
        children
      ) : (
        <>
          <span>Not set yet</span>
          {index >= 0 && (
            <button type="button" className="plan-link" onClick={() => onNavigate("steps")}>
              Set it in step {index + 1} →
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="plan-section">
      <h2 className="plan-heading">{title}</h2>
      {children}
    </section>
  );
}
