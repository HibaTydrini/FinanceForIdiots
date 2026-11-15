// Simple line icons (drawn by hand as SVG, no library needed).
// Each topic id in data/learningPath.json has a matching drawing below.
// To change a topic's picture, edit its paths here.

const PATHS: Record<string, string[]> = {
  // topics
  intro: ["M12 21v-8", "M12 13c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z", "M12 15.5c0-3-2.2-5.5-6.5-5.5 0 3 2.2 5.5 6.5 5.5z"],
  stocks: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  etfs: ["M3.5 10h17l-2.2 10H5.7z", "M8 10l4-6 4 6", "M9 13.5v3.5", "M12 13.5v3.5", "M15 13.5v3.5"],
  bonds: ["M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2z", "M9 8h6", "M9 12h6", "M9 16h3"],
  gics: ["M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z", "M8 11V7a4 4 0 0 1 8 0v4", "M12 15v2"],
  reits: ["M5 21V4h14v17", "M3 21h18", "M9 7.5h2", "M13 7.5h2", "M9 11h2", "M13 11h2", "M9 14.5h2", "M13 14.5h2", "M11 21v-3h2v3"],
  crypto: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M10 8h3a2 2 0 0 1 0 4h-3z", "M10 12h3.5a2 2 0 0 1 0 4H10z", "M10 7v10"],
  mutual_funds: ["M9 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M3 20a6 6 0 0 1 12 0", "M17 6.5a2.5 2.5 0 1 1 0 5", "M17 14a5 5 0 0 1 4 6"],
  fees: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6", "M9 12h6", "M9 15.5h3"],
  risk_return: ["M12 4v16", "M7 20h10", "M5 7h14", "M5 7l-3 6a3 3 0 0 0 6 0z", "M19 7l-3 6a3 3 0 0 0 6 0z"],
  volatility: ["M2 12l4-6 4 10 4-12 4 10 4-4"],
  investor_profile: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M15.5 8.5l-2 5-5 2 2-5z"],
  diversification: ["M7 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M17 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M7 14a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M17 14a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"],
  asset_allocation: ["M12 3v9h9", "M21 12a9 9 0 1 1-9-9", "M12 12l-6.4 6.4"],
  analyze_portfolio: ["M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z", "M21 21l-5-5", "M8 13l2-2 2 2 2-3"],
  goals_horizon: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z", "M12 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"],
  compound_growth: ["M3 21h18", "M6 18v-2", "M10 18v-5", "M14 18v-8", "M18 18V5"],
  dollar_cost_averaging: ["M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M3 10h18", "M8 3v4", "M16 3v4", "M8 14h.01", "M12 14h.01", "M16 14h.01", "M8 17.5h.01", "M12 17.5h.01"],
  rebalancing: ["M20 11a8 8 0 0 0-14.9-4", "M4 3v4h4", "M4 13a8 8 0 0 0 14.9 4", "M20 21v-4h-4"],
  hype_fomo: ["M3 10v4h4l7 4V6l-7 4z", "M17.5 9a4 4 0 0 1 0 6", "M7 14l1 5h2.5l-1-4.5"],
  registered_accounts: ["M3 9l9-5 9 5z", "M5.5 9v9", "M10 9v9", "M14 9v9", "M18.5 9v9", "M3 21h18"],
  investment_taxes: ["M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", "M8 6.5h8v3H8z", "M8.5 13h.01", "M12 13h.01", "M15.5 13h.01", "M8.5 17h.01", "M12 17h.01", "M15.5 17h.01"],
  market_index: ["M3 21h18", "M3 3v18", "M7.5 17v-5", "M12 17V8", "M16.5 17v-7", "M21 17V5"],
  bull_bear: ["M7 20V5", "M3 9l4-4 4 4", "M17 4v15", "M13 15l4 4 4-4"],
  research: ["M4 5h12v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", "M16 8h4v10a2 2 0 0 1-4 0", "M7 9h6", "M7 12.5h6", "M7 16h4"],
  simulation: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M10 8.5l5.5 3.5-5.5 3.5z"],
  // slide pictures
  example: ["M9 18h6", "M10 21h4", "M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"],
  done: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M8 12l3 3 5-6"],
};

type Props = { name: string; size?: number; className?: string };

export default function Icon({ name, size = 24, className }: Props) {
  const paths = PATHS[name] ?? PATHS.example;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
