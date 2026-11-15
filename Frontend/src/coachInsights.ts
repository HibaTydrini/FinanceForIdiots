// What the AI Coach says about a demo portfolio on the Portfolio page:
//   - facts: the "What stands out" list
//   - ideas: the "Ideas for your next $1,000" wheel
//
// Today both come from hardcoded demo files (demoPortfolios.json and demoIdeas.json).
// When the chatbot is ready, it takes over by answering POST {VITE_API_URL}/insights with the
// same shape as `CoachInsights` below, and Frontend/.env gets VITE_COACH_INSIGHTS=on.
// If the chatbot is off, slow or returns something unexpected, the page keeps the demo text,
// so the page never breaks. Write all text to the user as "you/your".

import ideasData from "./data/demoIdeas.json";

export type FactLevel = "watch" | "good" | "info";

export type CoachFact = {
    kind: string; // short id, e.g. "concentration", "bonds", "horizon"
    level: FactLevel; // watch = "Worth a look", good = "Looking good", info = "Good to know"
    text: string; // one or two sentences, written to the user ("your account ...")
};

export type CoachIdea = {
    ticker: string; // e.g. "XIU.TO"
    name: string; // e.g. "iShares S&P/TSX 60 Index ETF"
    type: string; // what the user sees above the name, e.g. "Stock ETF (Canada)"
    pct: number; // share of the next contribution; all ideas add up to 100
    why: string; // one or two sentences, written to the user
    tip?: string; // optional: the fact `kind` this idea answers
};

export type CoachInsights = {
    facts: CoachFact[];
    ideas: { amount: number; ideas: CoachIdea[] } | null; // amount = the next contribution in CAD
};

// The demo portfolio fields the page needs to build insights.
type PortfolioLike = {
    id: string;
    name: string;
    account: string;
    risk: string;
    horizon: string;
    goal: string;
    experience: string;
    preferences: string[];
    totals: { valueCad: number; investedCad: number; gainPct: number; worstDropPct: number };
    holdings: { ticker: string; name: string; assetClass: string; sector: string; weightPct: number; gainPct: number }[];
    facts: { kind: string; level: string; text: string }[];
};

const LEVELS: FactLevel[] = ["watch", "good", "info"];
const asLevel = (l: string): FactLevel => (LEVELS.includes(l as FactLevel) ? (l as FactLevel) : "info");

// The hardcoded version, used until the chatbot takes over.
export function demoInsights(p: PortfolioLike): CoachInsights {
    const plan = (ideasData.clients as Record<string, { amount: number; ideas: CoachIdea[] }>)[p.id];
    return {
        facts: p.facts.map((f) => ({ ...f, level: asLevel(f.level) })),
        ideas: plan ?? null,
    };
}

// What gets sent to the chatbot: a small summary (no daily price history), like the chat page sends.
export function portfolioSummary(p: PortfolioLike) {
    return {
        id: p.id,
        name: p.name,
        account: p.account,
        risk: p.risk,
        horizon: p.horizon,
        goal: p.goal,
        experience: p.experience,
        preferences: p.preferences,
        valueCad: p.totals.valueCad,
        investedCad: p.totals.investedCad,
        gainPct: p.totals.gainPct,
        worstDropPct: p.totals.worstDropPct,
        holdings: p.holdings.map((h) => ({
            ticker: h.ticker,
            name: h.name,
            type: h.assetClass,
            sector: h.sector,
            weightPct: h.weightPct,
            gainPct: h.gainPct,
        })),
        demoFacts: p.facts, // the hardcoded facts, as a starting point the chatbot can improve on
    };
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const chatbotInsightsOn = import.meta.env.VITE_COACH_INSIGHTS === "on";

// Checks the chatbot's answer has the right shape; anything off falls back to the demo version.
function clean(raw: unknown, fallback: CoachInsights): CoachInsights {
    const r = raw as Partial<CoachInsights> | null;
    const facts = Array.isArray(r?.facts)
        ? r.facts
            .filter((f) => f && typeof f.text === "string")
            .map((f) => ({ kind: String(f.kind ?? "coach"), level: asLevel(String(f.level)), text: f.text }))
        : [];
    const list = r?.ideas?.ideas;
    const ideasOk =
        Array.isArray(list) &&
        list.length > 0 &&
        list.every((i) => i && typeof i.name === "string" && typeof i.pct === "number") &&
        Math.round(list.reduce((s, i) => s + i.pct, 0)) === 100;
    return {
        facts: facts.length ? facts : fallback.facts,
        ideas: ideasOk ? { amount: Number(r!.ideas!.amount) || 1000, ideas: list } : fallback.ideas,
    };
}

// Asks the chatbot for this portfolio's insights. Returns null when the chatbot is not switched on
// or does not answer, so the caller keeps the demo version.
export async function fetchCoachInsights(p: PortfolioLike, signal?: AbortSignal): Promise<CoachInsights | null> {
    if (!chatbotInsightsOn) return null;
    try {
        const res = await fetch(`${API_URL}/insights`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ portfolio: portfolioSummary(p) }),
            signal,
        });
        if (!res.ok) return null;
        return clean(await res.json(), demoInsights(p));
    } catch {
        return null;
    }
}
