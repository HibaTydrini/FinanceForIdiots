// "What stands out" on the Portfolio page: the coach's observations as a plain, readable list.
// Each point has a topic name, the coach's sentence (numbers in bold, not blown up), a thin
// "share of your account" bar when the number really is a share of the account, and two actions:
// open the matching lesson, or ask the AI Coach about this exact point. Pills filter by level.
import { useState } from "react";
import type { ReactNode } from "react";
import Icon from "../../shared/Icon";
import type { CoachFact, FactLevel } from "./coachInsights";

const LEVEL_LABEL: Record<FactLevel, string> = { watch: "Worth a look", good: "Looking good", info: "Good to know" };
const LEVEL_ORDER: FactLevel[] = ["watch", "good", "info"];

// fact kind -> topic name, icon (shared/Icon.tsx) and the Learn page lesson that explains it
type Kind = { topic: string; icon: string; lesson?: string; share?: boolean };
const KINDS: Record<string, Kind> = {
  concentration: { topic: "Single company", icon: "diversification", lesson: "diversification", share: true },
  sector: { topic: "One industry", icon: "asset_allocation", lesson: "diversification", share: true },
  crypto: { topic: "Crypto", icon: "crypto", lesson: "crypto", share: true },
  bonds: { topic: "Bonds", icon: "bonds", lesson: "bonds", share: true },
  risk: { topic: "Ups and downs", icon: "volatility", lesson: "volatility" },
  drop: { topic: "Worst drop", icon: "bull_bear", lesson: "volatility" },
  inflation: { topic: "Growth vs. prices", icon: "compound_growth", lesson: "compound_growth" },
  horizon: { topic: "Your timeline", icon: "goals_horizon", lesson: "goals_horizon", share: true },
  "fund-tilt": { topic: "One fund", icon: "etfs", lesson: "etfs", share: true },
  currency: { topic: "U.S. dollars", icon: "market_index", lesson: "diversification", share: true },
  "bonds-fell": { topic: "Bond prices", icon: "bonds", lesson: "bonds" },
  "home-bias": { topic: "Only Canada", icon: "diversification", lesson: "diversification", share: true },
  spread: { topic: "Spread out", icon: "diversification", lesson: "diversification" },
  "recent-buy": { topic: "Recent purchase", icon: "stocks", lesson: "hype_fomo" },
  tax: { topic: "Taxes", icon: "investment_taxes", lesson: "investment_taxes" },
  values: { topic: "Your values", icon: "research", lesson: "research" },
  fees: { topic: "Fees", icon: "fees", lesson: "fees" },
};
const FALLBACK: Kind = { topic: "Note", icon: "example" };

const NUMBER = /([-+]?\$?\d[\d,]*(?:\.\d+)?%?)/g;

// The sentence with its numbers in bold.
function withBoldNumbers(text: string): ReactNode[] {
  return text.split(NUMBER).map((part, i) => (i % 2 === 1 && /\d/.test(part) ? <strong key={i}>{part}</strong> : part));
}

// For "share of your account" facts: the first percentage, as 0-100.
function share(fact: CoachFact, kind: Kind): number | null {
  if (!kind.share) return null;
  const n = Number(fact.text.match(/(\d+(?:\.\d+)?)%/)?.[1]);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

type Props = {
  facts: CoachFact[];
  onAsk?: (question: string) => void;
  onOpenLesson?: (topicId: string) => void;
  children?: ReactNode;
};

export default function StandsOut({ facts, onAsk, onOpenLesson, children }: Props) {
  const [filter, setFilter] = useState<FactLevel | "all">("all");
  const counts = Object.fromEntries(LEVEL_ORDER.map((l) => [l, facts.filter((f) => f.level === l).length])) as Record<
    FactLevel,
    number
  >;
  const shown = filter === "all" ? facts : facts.filter((f) => f.level === filter);

  return (
    <section className="demo-card so">
      <div className="so-head">
        <h3>What stands out</h3>
        <div className="so-filters" role="group" aria-label="Show">
          <button type="button" className={filter === "all" ? "active" : ""} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All <span>{facts.length}</span>
          </button>
          {LEVEL_ORDER.filter((l) => counts[l] > 0).map((l) => (
            <button
              type="button"
              key={l}
              className={`${l} ${filter === l ? "active" : ""}`}
              aria-pressed={filter === l}
              onClick={() => setFilter(filter === l ? "all" : l)}
            >
              {LEVEL_LABEL[l]} <span>{counts[l]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="so-list">
        {shown.map((f) => {
          const kind = KINDS[f.kind] ?? FALLBACK;
          const part = share(f, kind);
          return (
            <li key={f.kind + f.text} className={`so-item ${f.level}`}>
              <span className="so-icon" aria-hidden="true">
                <Icon name={kind.icon} size={18} />
              </span>
              <div className="so-main">
                <p className="so-title">
                  <strong>{kind.topic}</strong>
                  <span className="so-level">{LEVEL_LABEL[f.level]}</span>
                </p>
                <p className="so-text">{withBoldNumbers(f.text)}</p>

                {part !== null && (
                  <div className="so-share" aria-hidden="true">
                    <div className="so-share-bar">
                      <div style={{ width: `${Math.max(part, 0.5)}%` }} />
                    </div>
                    <span>{part}% of your account</span>
                  </div>
                )}

                {(onAsk || (kind.lesson && onOpenLesson)) && (
                  <div className="so-actions">
                    {kind.lesson && onOpenLesson && (
                      <button type="button" onClick={() => onOpenLesson(kind.lesson!)}>
                        Learn why →
                      </button>
                    )}
                    {onAsk && (
                      <button
                        type="button"
                        className="so-ask"
                        onClick={() =>
                          onAsk(`About my portfolio: "${f.text}" What does this mean for me, and what are my options?`)
                        }
                      >
                        Ask the coach
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {children}
    </section>
  );
}
