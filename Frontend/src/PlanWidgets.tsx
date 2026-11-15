// The small tools inside Baby Steps "Do it" cards: goal card, fee calculator, example mix,
// account type, monthly contribution and the "rule for myself".
// Each one saves its part of the plan (babyStepsStore.ts). All figures are examples for learning.
import { useState } from "react";
import { RULE_PREFIX, savePlan, todayISO } from "./babyStepsStore";
import type { Action, MixOption, Plan } from "./babyStepsStore";
import { EXAMPLE_GROWTH_PCT, futureValue, money, monthlyNeeded, monthsUntil } from "./planMath";

type Props = { action: Action; plan: Plan; suggest?: string };

export default function PlanWidget({ action, plan, suggest }: Props) {
  switch (action.widget) {
    case "goal":
      return <GoalCard plan={plan} actionId={action.id} />;
    case "fees":
      return <FeeCalculator plan={plan} />;
    case "mix":
      return <MixPicker plan={plan} actionId={action.id} options={action.options ?? []} suggest={suggest} />;
    case "account":
      return <AccountPicker plan={plan} actionId={action.id} suggest={suggest} />;
    case "monthly":
      return <MonthlyPicker plan={plan} actionId={action.id} />;
    case "rule":
      return <RuleWriter plan={plan} actionId={action.id} />;
    default:
      return null;
  }
}

function Saved({ show }: { show: boolean }) {
  return show ? (
    <span className="bs-saved" role="status">
      Saved to My Plan ✓
    </span>
  ) : null;
}

// ---------- step 2: goal card ----------

function GoalCard({ plan, actionId }: { plan: Plan; actionId: string }) {
  const [today] = useState(todayISO);
  const [label, setLabel] = useState(plan.goal?.label ?? "");
  const [amount, setAmount] = useState(plan.goal ? String(plan.goal.amount) : "");
  const [date, setDate] = useState(plan.goal?.date ?? "");

  const target = Number(amount);
  const valid = label.trim() !== "" && target > 0 && date > today;
  const months = valid ? monthsUntil(date, today) : 0;
  const saved =
    plan.goal !== undefined &&
    plan.goal.label === label.trim() &&
    plan.goal.amount === target &&
    plan.goal.date === date;

  return (
    <div className="bs-widget">
      <div className="bs-fields">
        <label>
          What is it for?
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="A first home, retirement..." maxLength={60} />
        </label>
        <label>
          Target amount ($)
          <input type="number" min="1" step="100" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Target date
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      {date !== "" && date <= today && <p className="bs-hint">Pick a date in the future.</p>}

      {valid && (
        <div className="bs-results" aria-live="polite">
          <div className="bs-result main">
            <span>To save each month</span>
            <strong>{money(monthlyNeeded(target, months))}</strong>
            <em>
              {money(target)} over {months} {months === 1 ? "month" : "months"}, with no growth assumed.
            </em>
          </div>
          <div className="bs-result example">
            <span>Example with growth (not guaranteed)</span>
            <strong>{money(monthlyNeeded(target, months, EXAMPLE_GROWTH_PCT))}</strong>
            <em>
              Only an illustration: it pretends your money grows {EXAMPLE_GROWTH_PCT}% every year. Real
              investments go up and down and can lose value.
            </em>
          </div>
        </div>
      )}

      <div className="bs-save">
        <button
          type="button"
          className="primary"
          disabled={!valid}
          onClick={() => savePlan({ goal: { label: label.trim(), amount: target, date } }, actionId)}
        >
          Save to my plan
        </button>
        <Saved show={saved} />
      </div>
    </div>
  );
}

// ---------- step 4: fee calculator ----------

const FEE_YEARS = 25;
const LOW_FEE = 0.2;
const HIGH_FEE = 2;

function FeeCalculator({ plan }: { plan: Plan }) {
  const [monthly, setMonthly] = useState(String(plan.monthly?.amount ?? 200));
  const amount = Math.max(0, Number(monthly) || 0);

  const paidIn = amount * 12 * FEE_YEARS;
  const low = futureValue(amount, FEE_YEARS, EXAMPLE_GROWTH_PCT - LOW_FEE);
  const high = futureValue(amount, FEE_YEARS, EXAMPLE_GROWTH_PCT - HIGH_FEE);

  return (
    <div className="bs-widget">
      <div className="bs-fields">
        <label>
          Monthly amount ($)
          <input type="number" min="0" step="10" inputMode="numeric" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </label>
      </div>

      {amount > 0 && (
        <div aria-live="polite">
          <ul className="bs-fee-bars">
            <FeeBar label={`With a ${LOW_FEE}% fee`} value={low} max={low} good />
            <FeeBar label={`With a ${HIGH_FEE}% fee`} value={high} max={low} />
            <FeeBar label="Money you put in" value={paidIn} max={low} muted />
          </ul>
          <p className="bs-fee-gap">
            Same contributions, same investments. The higher fee leaves you with about{" "}
            <strong>{money(low - high)}</strong> less after {FEE_YEARS} years.
          </p>
        </div>
      )}

      <p className="bs-note">
        Example only. It pretends both funds grow {EXAMPLE_GROWTH_PCT}% a year before fees for{" "}
        {FEE_YEARS} years, which is not guaranteed. Real returns go up and down.
      </p>
    </div>
  );
}

function FeeBar({ label, value, max, good, muted }: { label: string; value: number; max: number; good?: boolean; muted?: boolean }) {
  return (
    <li>
      <span>{label}</span>
      <span className="bs-bar">
        <i className={good ? "good" : muted ? "muted" : ""} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </span>
      <strong>{money(value)}</strong>
    </li>
  );
}

// ---------- step 5: example mix ----------

function MixPicker({ plan, actionId, options, suggest }: { plan: Plan; actionId: string; options: MixOption[]; suggest?: string }) {
  const savedOption = options.find(
    (o) => plan.mix && o.stocks === plan.mix.stocks && o.bonds === plan.mix.bonds && o.cash === plan.mix.cash,
  );
  const [picked, setPicked] = useState(savedOption?.id ?? suggest ?? options[0]?.id);
  const option = options.find((o) => o.id === picked);

  return (
    <div className="bs-widget">
      <div className="bs-choices" role="group" aria-label="Example mixes">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`bs-choice ${o.id === picked ? "selected" : ""}`}
            aria-pressed={o.id === picked}
            onClick={() => setPicked(o.id)}
          >
            <strong>{o.name}</strong>
            {o.id === suggest && <em className="bs-badge">Matches your risk answer</em>}
            <MixBar mix={o} />
            <span>
              {o.stocks}% stocks · {o.bonds}% bonds · {o.cash}% cash
            </span>
            <span>{o.detail}</span>
          </button>
        ))}
      </div>

      <p className="bs-note">Example for learning, not a recommendation.</p>

      <div className="bs-save">
        <button
          type="button"
          className="primary"
          disabled={!option}
          onClick={() => option && savePlan({ mix: { stocks: option.stocks, bonds: option.bonds, cash: option.cash } }, actionId)}
        >
          Save to my plan
        </button>
        <Saved show={savedOption !== undefined && savedOption.id === picked} />
      </div>
    </div>
  );
}

export function MixBar({ mix }: { mix: { stocks: number; bonds: number; cash: number } }) {
  return (
    <span className="bs-mixbar" aria-hidden="true">
      <i className="stocks" style={{ width: `${mix.stocks}%` }} />
      <i className="bonds" style={{ width: `${mix.bonds}%` }} />
      <i className="cash" style={{ width: `${mix.cash}%` }} />
    </span>
  );
}

// ---------- step 6: account type ----------

const ACCOUNTS = [
  { id: "TFSA", name: "TFSA", detail: "Growth is tax-free, and you can take money out any time. Flexible for many goals." },
  { id: "RRSP", name: "RRSP", detail: "Lowers your taxes today. Made for retirement: you pay tax when you take money out later." },
  { id: "FHSA", name: "FHSA", detail: "Made for a first home: a tax break when you put money in, and no tax when you take it out for the home." },
];

function AccountPicker({ plan, actionId, suggest }: { plan: Plan; actionId: string; suggest?: string }) {
  const [picked, setPicked] = useState(plan.account ?? suggest ?? "TFSA");
  // the account that fits the user's goal comes first
  const ordered = [...ACCOUNTS].sort((a, b) => Number(b.id === suggest) - Number(a.id === suggest));

  return (
    <div className="bs-widget">
      <div className="bs-choices" role="group" aria-label="Account types">
        {ordered.map((a) => (
          <button
            type="button"
            key={a.id}
            className={`bs-choice ${a.id === picked ? "selected" : ""}`}
            aria-pressed={a.id === picked}
            onClick={() => setPicked(a.id)}
          >
            <strong>{a.name}</strong>
            {a.id === suggest && <em className="bs-badge">First for your goal</em>}
            <span>{a.detail}</span>
          </button>
        ))}
      </div>

      <p className="bs-note">
        For learning, not a recommendation. Each account has rules and limits that change, so check
        official sources or ask your bank before you open one.
      </p>

      <div className="bs-save">
        <button type="button" className="primary" onClick={() => savePlan({ account: picked }, actionId)}>
          Save to my plan
        </button>
        <Saved show={plan.account === picked} />
      </div>
    </div>
  );
}

// ---------- step 7: monthly contribution ----------

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

function MonthlyPicker({ plan, actionId }: { plan: Plan; actionId: string }) {
  const [today] = useState(todayISO);
  const [amount, setAmount] = useState(plan.monthly ? String(plan.monthly.amount) : "");
  const [day, setDay] = useState(plan.monthly?.day ?? 1);

  const value = Number(amount);
  const goal = plan.goal;
  const goalMonthly = goal && goal.date > today ? monthlyNeeded(goal.amount, monthsUntil(goal.date, today)) : null;

  return (
    <div className="bs-widget">
      <div className="bs-fields">
        <label>
          Amount each month ($)
          <input type="number" min="1" step="10" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Day of the month
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="bs-note">
        Tip: pick the day right after payday.
        {goalMonthly !== null && goal && (
          <>
            {" "}
            Your goal card ({goal.label}) works out to about {money(goalMonthly)} a month with no growth assumed.
          </>
        )}
      </p>

      <div className="bs-save">
        <button
          type="button"
          className="primary"
          disabled={!(value > 0)}
          onClick={() => savePlan({ monthly: { amount: value, day } }, actionId)}
        >
          Save to my plan
        </button>
        <Saved show={plan.monthly !== undefined && plan.monthly.amount === value && plan.monthly.day === day} />
      </div>
    </div>
  );
}

// ---------- step 8: rule for myself ----------

const RULE_IDEAS = [
  "wait 30 days before I change anything",
  "re-read my goal and my timeline first",
  "talk to an advisor before I make any decision",
];

function RuleWriter({ plan, actionId }: { plan: Plan; actionId: string }) {
  const [rule, setRule] = useState(plan.rule ?? "");
  const text = rule.trim();

  return (
    <div className="bs-widget">
      <label className="bs-rule">
        <span>{RULE_PREFIX}...</span>
        <input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="finish the sentence" maxLength={160} />
      </label>

      <div className="bs-ideas">
        <span>Need an idea?</span>
        {RULE_IDEAS.map((idea) => (
          <button type="button" key={idea} className="bs-chip" onClick={() => setRule(idea)}>
            {idea}
          </button>
        ))}
      </div>

      <div className="bs-save">
        <button type="button" className="primary" disabled={text === ""} onClick={() => savePlan({ rule: text }, actionId)}>
          Save to my plan
        </button>
        <Saved show={plan.rule !== undefined && plan.rule === text} />
      </div>
    </div>
  );
}
