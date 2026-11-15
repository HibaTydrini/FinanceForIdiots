// "Ideas for your next $1,000" wheel.
// A donut that splits the client's next contribution into a few example ideas. Tap, hover or tab to a
// colour to see what it is, its share and why it was picked.
// The ideas come in as a prop (see coachInsights.ts): hardcoded demo ideas today, the AI Coach's later.

import { useState } from "react";
import { C } from "../../shared/chartColors";
import type { CoachInsights } from "./coachInsights";

// slice colours in a fixed order (checked for colour-blind separation); dark text on the light ones
const SLICE = [
    { fill: C.blue, ink: "#ffffff" },
    { fill: C.orange, ink: "#ffffff" },
    { fill: C.aqua, ink: "#0b3d2b" },
    { fill: C.yellow, ink: "#3d2a00" },
    { fill: C.violet, ink: "#ffffff" },
];

const SIZE = 260;
const R_OUT = 120;
const R_IN = 72;
const CX = SIZE / 2;
const CY = SIZE / 2;

const money = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;

function point(r: number, angle: number) {
    return [CX + r * Math.sin(angle), CY - r * Math.cos(angle)];
}

// a ring slice from angle a0 to a1 (radians, 0 = top, clockwise)
function arc(a0: number, a1: number, rOut: number, rIn: number) {
    a1 = Math.min(a1, a0 + Math.PI * 2 - 0.0001); // a single 100% idea still draws a full ring
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = point(rOut, a0);
    const [x1, y1] = point(rOut, a1);
    const [x2, y2] = point(rIn, a1);
    const [x3, y3] = point(rIn, a0);
    return `M${x0},${y0}A${rOut},${rOut} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${rIn},${rIn} 0 ${large} 0 ${x3},${y3}Z`;
}

export default function NextIdeas({ plan }: { plan: CoachInsights["ideas"] }) {
    const [active, setActive] = useState(0);
    if (!plan || plan.ideas.length === 0) return null;

    const ideas = plan.ideas;
    const sel = ideas[Math.min(active, ideas.length - 1)];
    const selColor = SLICE[Math.min(active, ideas.length - 1) % SLICE.length].fill;

    const turn = (pct: number) => (pct / 100) * Math.PI * 2;
    const slices = ideas.map((idea, i) => {
        const a0 = turn(ideas.slice(0, i).reduce((sum, x) => sum + x.pct, 0));
        const a1 = a0 + turn(idea.pct);
        const mid = (a0 + a1) / 2;
        return { idea, i, a0, a1, mid };
    });

    return (
        <section className="demo-card ideas">
            <div className="ideas-head">
                <h3>Ideas for your next {money(plan.amount)}</h3>
                <span className="ideas-badge">AI Coach preview</span>
            </div>
            <p className="ideas-sub">Tap a colour to see each idea.</p>

            <div className="ideas-body">
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="ideas-wheel"
                    role="group"
                    aria-label={`Ideas for the next ${money(plan.amount)}`}
                >
                    {slices.map(({ idea, i, a0, a1, mid }) => {
                        const on = i === active;
                        const [lx, ly] = point((R_OUT + R_IN) / 2 + (on ? 4 : 0), mid);
                        const s = SLICE[i % SLICE.length];
                        return (
                            <g
                                key={idea.ticker}
                                className={`ideas-slice${on ? " on" : ""}`}
                                tabIndex={0}
                                role="button"
                                aria-pressed={on}
                                aria-label={`${idea.pct}% ${idea.name}, ${idea.type}`}
                                onClick={() => setActive(i)}
                                onMouseEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setActive(i);
                                    }
                                }}
                            >
                                <path
                                    d={arc(a0, a1, on ? R_OUT + 8 : R_OUT, R_IN)}
                                    fill={s.fill}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    opacity={on ? 1 : 0.88}
                                />
                                {idea.pct >= 8 && (
                                    <text x={lx} y={ly + 5} textAnchor="middle" className="ideas-pct" fill={s.ink}>
                                        {idea.pct}%
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    <text x={CX} y={CY - 8} textAnchor="middle" className="ideas-center-amount">
                        {money((plan.amount * sel.pct) / 100)}
                    </text>
                    <text x={CX} y={CY + 14} textAnchor="middle" className="ideas-center-label">
                        of {money(plan.amount)}
                    </text>
                </svg>

                <div className="ideas-detail" aria-live="polite">
                    <span className="ideas-type">
                        <i style={{ background: selColor }} />
                        {sel.type}
                    </span>
                    <strong className="ideas-name">{sel.name}</strong>
                    <span className="ideas-meta">
                        {sel.ticker} · {sel.pct}% of the next {money(plan.amount)}
                    </span>
                    <p className="ideas-why" style={{ borderLeftColor: selColor }}>
                        <b>Why this idea</b>
                        {sel.why}
                    </p>
                </div>
            </div>

            <p className="disclaimer">Demo examples. Educational only, not financial advice.</p>
        </section>
    );
}
