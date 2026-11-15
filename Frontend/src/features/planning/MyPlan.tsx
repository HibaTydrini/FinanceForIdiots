// "My Plan": the long-term plan built in Baby Steps, and what to do next.
// The plan itself is saved by babyStepsStore.ts; this page shows it and adds a timeline:
// this week, this month, every month (CheckIn.tsx), every year, when life changes, and Level 2.
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
      "Your first contribution is the first time money moves into your investment account.",
      "If you set up an automatic contribution, it happens by itself on the day you chose.",
      "If not, you can move the amount from your plan yourself in your online banking.",
    ],
  },
  {
    id: "plan-check-arrived",
    label: "Check that it arrived",
    how: [
      "A few days after the contribution day, log in to your investment account.",
      "Look for the deposit and check that the amount matches your plan.",
      "See whether the money is sitting as cash or has been invested, so there are no surprises.",
    ],
  },
];

const LIFE_CHANGES = [
  {
    title: "A new job or a raise",
    text: "A change in income is a good moment to look at your monthly amount again. A new employer may also offer a savings plan at work, so ask what is available.",
    topics: ["dollar_cost_averaging", "registered_accounts"],
  },
  {
    title: "Moving",
    text: "Give your bank your new address. Moving to another province or country can change how your investments are taxed, so ask your bank before you go.",
    topics: ["investment_taxes", "registered_accounts"],
  },
  {
    title: "Buying a home",
    text: "A home is a goal with a date. As the date gets closer, the money for it usually needs less risk. Go back to your goal card and your timeline.",
    topics: ["goals_horizon", "registered_accounts", "gics"],
  },
  {
    title: "A big market drop",
    text: "Drops are a normal part of investing, even though they feel awful. Read your rule for yourself before you change anything.",
    topics: ["volatility", "hype_fomo"],
    showRule: true,
  },
];

const LEVEL_2 = ["rebalancing", "research", "market_index", "bull_bear", "investment_taxes"];

export default function MyPlan({ answers, onNavigate }: Props) {
  const { state } = useBabySteps();
  const [today] = useState(todayISO);
  const steps = useMemo(() => getSteps(answers), [answers]);
  const level = levelFromKnowledge(answers[0]);
  const { plan } = state;

  const finished = steps.every((s) => state.completedSteps.includes(s.id));
  const stepsLeft = steps.length - state.completedSteps.length;
  // real-world setup tasks from the steps (open the account, set up the automatic contribution)
  const setup = steps.flatMap((s) => s.doIt.filter((a) => a.later).map((action) => ({ action, step: s })));
  const setupLeft = setup.filter(({ action }) => !state.doneActions.includes(action.id));

  const goalMonths = plan.goal && plan.goal.date > today ? monthsUntil(plan.goal.date, today) : null;

  function toggle(action: Action) {
    setActionDone(action.id, !state.doneActions.includes(action.id));
    return undefined;
  }

  return (
    <div className="plan">
      <p className="plan-disclaimer">
        Your plan is educational and is not a formal investment suitability assessment or financial advice.
      </p>

      {/* ---------- the saved plan ---------- */}
      <div className="plan-grid">
        <PlanCard title="My goal" field="goal" steps={steps} filled={plan.goal !== undefined} onNavigate={onNavigate}>
          {plan.goal && (
            <>
              <strong>{plan.goal.label}</strong>
              <span>
                {money(plan.goal.amount)} by {formatDate(plan.goal.date)}
              </span>
              {goalMonths !== null && (
                <span className="plan-small">
                  About {money(monthlyNeeded(plan.goal.amount, goalMonths))} a month, with no growth assumed.
                </span>
              )}
            </>
          )}
        </PlanCard>

        <PlanCard title="My account" field="account" steps={steps} filled={plan.account !== undefined} onNavigate={onNavigate}>
          <strong>{plan.account}</strong>
          <span className="plan-small">The account type you chose to start with.</span>
        </PlanCard>

        <PlanCard title="My monthly contribution" field="monthly" steps={steps} filled={plan.monthly !== undefined} onNavigate={onNavigate}>
          {plan.monthly && (
            <>
              <strong>{money(plan.monthly.amount)} a month</strong>
              <span>On day {plan.monthly.day} of each month</span>
            </>
          )}
        </PlanCard>

        <PlanCard title="My example mix" field="mix" steps={steps} filled={plan.mix !== undefined} onNavigate={onNavigate}>
          {plan.mix && (
            <>
              <MixBar mix={plan.mix} />
              <span>
                {plan.mix.stocks}% stocks · {plan.mix.bonds}% bonds · {plan.mix.cash}% cash
              </span>
              <span className="plan-small">Example for learning, not a recommendation.</span>
            </>
          )}
        </PlanCard>

        <PlanCard title="My rule for myself" field="rule" steps={steps} filled={plan.rule !== undefined} onNavigate={onNavigate} wide>
          <blockquote className="plan-rule">
            {RULE_PREFIX} {plan.rule}
          </blockquote>
        </PlanCard>
      </div>

      {/* ---------- timeline ---------- */}
      <h2 className="plan-heading">What's next</h2>

      <Block when="This week" title="Get set up">
        {!finished && (
          <p className="plan-text">
            You still have {stepsLeft} Baby {stepsLeft === 1 ? "Step" : "Steps"} to go.{" "}
            <button type="button" className="plan-link" onClick={() => onNavigate("steps")}>
              Continue Baby Steps
            </button>
          </p>
        )}
        {setupLeft.length === 0 ? (
          <p className="plan-text">Your account and automatic contribution are set up. Nothing to do here.</p>
        ) : (
          <ul className="bs-actions">
            {setupLeft.map(({ action, step }) => (
              <ActionCard key={action.id} action={action} done={false} onToggle={() => toggle(action)} terms={step.terms} />
            ))}
          </ul>
        )}
      </Block>

      <Block when="This month" title="Your first contribution">
        <ul className="bs-actions">
          {THIS_MONTH.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              done={state.doneActions.includes(action.id)}
              onToggle={() => toggle(action)}
            />
          ))}
        </ul>
      </Block>

      <Block when="Every month" title="30-second check-in" id="check-in">
        <CheckIn plan={plan} level={level} onNavigate={onNavigate} />
      </Block>

      <Block when="Every year" title="Annual check-up">
        <ul className="plan-list">
          <li>
            <strong>Check your mix.</strong> Over a year, some investments grow faster than others
            and your mix drifts. The lesson below explains how to bring it back.
          </li>
          <li>
            <strong>Review your contribution room.</strong> New TFSA room is added each January.
            For an RRSP, contributions made up to about 60 days after the end of the year can still
            count for that year's taxes. The limits and exact dates change, so check your CRA My
            Account or ask your bank.
          </li>
          <li>
            <strong>Look at your goal again.</strong> Is the amount or the date still right?
          </li>
        </ul>
        <LessonLinks topics={["rebalancing"]} level={level} onNavigate={onNavigate} />
      </Block>

      <Block when="When life changes" title="Come back to your plan">
        <div className="plan-life">
          {LIFE_CHANGES.map((change) => (
            <div className="plan-life-card" key={change.title}>
              <h4>{change.title}</h4>
              <p>{change.text}</p>
              {change.showRule && plan.rule && (
                <blockquote className="plan-rule">
                  {RULE_PREFIX} {plan.rule}
                </blockquote>
              )}
              <LessonLinks topics={change.topics} level={level} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </Block>

      <Block when="Level 2" title="Growing">
        {finished ? (
          <>
            <p className="plan-text">You finished Baby Steps. These lessons are a good next stop.</p>
            <LessonLinks topics={LEVEL_2} level={level} onNavigate={onNavigate} />
          </>
        ) : (
          <p className="plan-text plan-locked">
            Finish Baby Steps to unlock your next lessons: rebalancing, researching an investment,
            market indexes, bull and bear markets, and how investments are taxed.
          </p>
        )}
      </Block>

      <p className="disclaimer">
        Your plan is educational and is not a formal investment suitability assessment or financial advice.
      </p>
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
          <span>Not set yet.</span>
          {index >= 0 && (
            <button type="button" className="plan-link" onClick={() => onNavigate("steps")}>
              You'll set it in Baby Step {index + 1}: {steps[index].title}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Block({ when, title, id, children }: { when: string; title: string; id?: string; children: ReactNode }) {
  return (
    <section className="plan-block" id={id}>
      <div className="plan-when">
        <span>{when}</span>
        <h3>{title}</h3>
      </div>
      <div className="plan-block-body">{children}</div>
    </section>
  );
}
