import data from "../../data/demoPortfolios.json";

export type DemoPortfolioData = (typeof data.portfolios)[number];

export function findDemoPortfolio(id?: string | null): DemoPortfolioData | null {
  return data.portfolios.find((portfolio) => portfolio.id === id) ?? null;
}

export function demoPortfolioForCoach(p: DemoPortfolioData) {
  return {
    name: p.name, account: p.account, risk: p.risk, horizon: p.horizon, goal: p.goal,
    valueCad: p.totals.valueCad, investedCad: p.totals.investedCad,
    gainPct: p.totals.gainPct, worstDropPct: p.totals.worstDropPct,
    holdings: p.holdings.map((h) => ({ ticker: h.ticker, name: h.name, type: h.assetClass, sector: h.sector, weightPct: h.weightPct, gainPct: h.gainPct })),
  };
}
