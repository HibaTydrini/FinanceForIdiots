// "Connect my National Bank account (demo)".
// The user picks a pretend client, the account "connects", and their portfolio shows up
// with real numbers worked out from the datathon market data (scripts/build_demo_accounts.py).
// Nothing here is a real person or a real bank connection.

import { useEffect, useState } from "react";
import data from "../../data/demoPortfolios.json";

import { C } from "../../shared/chartColors";
import PortfolioChart from "./PortfolioChart";
import NextIdeas from "./NextIdeas";
import { demoInsights, fetchCoachInsights } from "./coachInsights";
import type { CoachInsights } from "./coachInsights";
import type { DemoPortfolioData } from "./demoPortfolioContext";
import "./DemoPortfolio.css";

const PORTFOLIOS = data.portfolios;

const CLASS_NAMES: Record<string, string> = {

  equity: "Single stocks",

  etf_equity: "Stock ETFs",

  etf_bond: "Bond ETFs",

  etf_commodity: "Gold",

  crypto: "Crypto",

};

const CLASS_COLORS: Record<string, string> = {

  equity: C.blue,

  etf_equity: C.violet,

  etf_bond: C.aqua,

  etf_commodity: C.yellow,

  crypto: C.orange,

};

const LEVEL_LABEL: Record<string, string> = { watch: "Worth a look", good: "Looking good", info: "Good to know" };

const money = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;

const pct = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

type Props = {
  onAskCoach?: (p: DemoPortfolioData) => void;
  onConnect?: (clientId: string) => void;
  onSelectClient?: (p: DemoPortfolioData) => void;
  selectionOnly?: boolean;
  initialClientId?: string | null;
};

export default function DemoPortfolio({
  onAskCoach,
  onConnect,
  onSelectClient,
  selectionOnly = false,
  initialClientId = null,
}: Props) {
  const [clientId, setClientId] = useState<string | null>(initialClientId);
  const [connecting, setConnecting] = useState(false);
  const [showContext, setShowContext] = useState(false);
  // the AI Coach's own "What stands out" and ideas, once the chatbot answers (see coachInsights.ts)
  const [coach, setCoach] = useState<{ id: string; insights: CoachInsights } | null>(null);

  useEffect(() => {
    const picked = PORTFOLIOS.find((x) => x.id === clientId);
    if (!picked) return;
    const stop = new AbortController();
    fetchCoachInsights(picked, stop.signal).then((r) => {
      if (r) setCoach({ id: picked.id, insights: r });
    });
    return () => stop.abort();
  }, [clientId]);

  function connect(id: string) {
    const selectedPortfolio = PORTFOLIOS.find((p) => p.id === id);
    if (!selectedPortfolio) return;

    onSelectClient?.(selectedPortfolio);
    if (selectionOnly) return;

    setConnecting(true);
    setClientId(id);
    onConnect?.(id);
    window.setTimeout(() => setConnecting(false), 1100);
  }

  const p = PORTFOLIOS.find((x) => x.id === clientId);

  if (selectionOnly || !p || connecting) {

    return (

      <div className="demo">

        <div className="demo-connect">

          <div className="demo-bank">

            <span className="demo-bank-logo">NB</span>

            <div>

              <h2>Connect your National Bank account</h2>

              <p>

                See your own investments explained simply, and let the AI Coach understand your portfolio.

              </p>

            </div>

            <span className="demo-badge">Demo</span>

          </div>

          {connecting ? (

            <div className="demo-loading" role="status">

              <span className="demo-spinner" />

              Connecting to National Bank as {p?.name}...

            </div>

          ) : (

            <>

              <p className="demo-pick">For the demo, log in as one of these pretend clients:</p>

              <div className="demo-clients">

                {PORTFOLIOS.map((c) => (

                  <button key={c.id} className="demo-client" onClick={() => connect(c.id)}>

                    <span className="demo-avatar">{c.name[0]}</span>

                    <strong>{c.name}, {c.age}</strong>

                    <span>{c.job}</span>

                    <span className="demo-chips">

                      <em className={`level-${c.experience.toLowerCase()}`}>{c.experience}</em>

                      <em>{c.account}</em>

                      <em>Risk: {c.risk}</em>

                    </span>

                    <span className="demo-goal">{c.goal}</span>

                    <span className="demo-login">Log in as {c.name} →</span>

                  </button>

                ))}

              </div>

            </>

          )}

        </div>

        <p className="disclaimer">

          Simulated connection: pretend clients, real historical prices from the datathon starter dataset

          (Yahoo Finance, Bank of Canada). No real accounts or banking data are used.

        </p>

      </div>

    );

  }

  const t = p.totals;
  const gainCad = t.valueCad + t.dividendsCad - t.investedCad;
  // the chatbot's version when it has answered for this client, otherwise the hardcoded demo version
  const insights = coach?.id === p.id ? coach.insights : demoInsights(p);
  const facts = [...insights.facts].sort((a, b) => order(a.level) - order(b.level));

  return (

    <div className="demo">

      <div className="demo-head">

        <div>

          <p className="eyebrow">NATIONAL BANK · {p.account} (DEMO)</p>

          <h2>Hi {p.name}, here is your portfolio</h2>

          <p className="demo-sub">

            Goal: {p.goal} · Risk profile: {p.risk} · Horizon: {p.horizon} · Experience: {p.experience}

          </p>

          <p className="demo-sub demo-background">{p.background}</p>

        </div>

      </div>

      <div className="demo-stats">

        <Stat label="Worth today" value={money(t.valueCad)} />

        <Stat label="Money put in" value={money(t.investedCad)} note={`since ${p.since.slice(0, 4)}`} />

        <Stat label="Total gain" value={pct(t.gainPct)} note={`${money(gainCad)} incl. dividends`} good={t.gainPct >= 0} />

        <Stat label="Worst drop" value={`${t.worstDropPct}%`} note={`${p.totals.worstDropFrom.slice(0, 7)} to ${p.totals.worstDropTo.slice(0, 7)}`} />

      </div>

  <PortfolioChart daily={p.daily} />

      <div className="demo-grid">

        <section className="demo-card">

          <h3>What stands out</h3>

          <ul className="demo-facts">

            {facts.map((f) => (

              <li key={f.kind + f.text} className={f.level}>

                <span className="demo-level">{LEVEL_LABEL[f.level]}</span>

                {f.text}

              </li>

            ))}

          </ul>

          {onAskCoach && (

            <button className="primary demo-ask" onClick={() => onAskCoach(p)}>

              Ask the AI Coach about my portfolio

            </button>

          )}

        </section>

        <div className="demo-side">
          <section className="demo-card">
            <h3>What you own, by type</h3>
            <Bars items={p.mix.assetClass.map((m) => ({ label: CLASS_NAMES[m.name] ?? m.name, pct: m.pct, color: CLASS_COLORS[m.name] ?? C.grey }))} />
            <h3>By sector</h3>
            <Bars items={p.mix.sector.slice(0, 6).map((m) => ({ label: shortSector(m.name), pct: m.pct, color: C.blue }))} />
          </section>

          <NextIdeas key={p.id} plan={insights.ideas} />
        </div>
      </div>

      <section className="demo-card">

        <h3>Your investments</h3>

        <div className="demo-table-wrap">

          <table className="demo-table">

            <thead>

              <tr>

                <th>Investment</th>

                <th>Type</th>

                <th>Share of account</th>

                <th>Worth (CAD)</th>

                <th>Since bought</th>

              </tr>

            </thead>

            <tbody>

              {p.holdings.map((h) => (

                <tr key={h.ticker}>

                  <td>

                    <strong>{h.name}</strong>

                    <span>{h.ticker} · bought {h.bought}</span>

                  </td>

                  <td>{CLASS_NAMES[h.assetClass] ?? h.assetClass}</td>

                  <td>

                    <span className="demo-weight">

                      <i style={{ width: `${Math.min(100, h.weightPct * 2)}%` }} />

                    </span>

                    {h.weightPct}%

                  </td>

                  <td>{money(h.valueCad)}</td>

                  <td className={h.gainPct >= 0 ? "up" : "down"}>{pct(h.gainPct)}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <p className="disclaimer">

          Prices as of {p.asOf}. U.S. holdings converted with the Bank of Canada USD/CAD rate. "Since bought" is the price

          change only; dividends ({money(t.dividendsCad)} in total) are counted in the total gain.

        </p>

      </section>

      <section className="demo-card">

        <button
          className="demo-toggle"
          onClick={() => setShowContext(!showContext)}
          aria-expanded={showContext}
        >
          {showContext ? "Hide" : "Show"} what the AI Coach knows about this portfolio
        </button>

        {showContext && <pre className="demo-context">{p.agentContext}</pre>}

      </section>

    </div>

  );

}

function Bars({ items }: { items: { label: string; pct: number; color: string }[] }) {

  return (

    <ul className="demo-bars">

      {items.map((it) => (

        <li key={it.label}>

          <span>{it.label}</span>

          <span className="demo-bar">

            <i style={{ width: `${it.pct}%`, background: it.color }} />

          </span>

          <strong>{it.pct}%</strong>

        </li>

      ))}

    </ul>

  );

}

function Stat({ label, value, note, good }: { label: string; value: string; note?: string; good?: boolean }) {

  return (

    <div className="demo-stat">

      <span>{label}</span>

      <strong className={good === undefined ? "" : good ? "up" : "down"}>{value}</strong>

      {note && <em>{note}</em>}

    </div>

  );

}

function order(level: string) {

  return level === "watch" ? 0 : level === "good" ? 1 : 2;

}

function shortSector(s: string) {

  return s

    .replace("Information Technology", "Tech")

    .replace("Broad market (U.S. growth/tech-heavy)", "U.S. tech-heavy ETF")

    .replace("Broad market (U.S., ESG-screened)", "U.S. ESG ETF")

    .replace("Broad market (Canada)", "Canada ETF")

    .replace("Broad market (U.S.)", "U.S. ETF")

    .replace("Bonds (Canada ultra short-term)", "Short-term bonds")

    .replace("Bonds (Canada aggregate)", "Canada bonds")

    .replace("Consumer Discretionary", "Consumer")

    .replace("Crypto asset", "Crypto");

}
