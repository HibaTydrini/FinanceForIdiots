// The "See it" slide of each topic: one clean chart or diagram.
// Numbers come from the topic's example in data/learningPath.json.
// Charts marked "Illustration" use made-up but realistic shapes, not real prices.

import type { ReactElement } from "react";
import { C } from "./chartColors";
import { Figure, LineChart, Columns, HBars, SplitBars, Donut, Flow, CompareTable, Mosaic } from "./chartParts";
import { MORE } from "./moreIllustrations";

type Chart = { caption: string; art: ReactElement };

const dollars = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;
const kDollars = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`);
const pct = (n: number) => `${Math.round(n)}%`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// $100 a month at 6% a year (0.5% a month), value at ages 20, 25, ... 65
const fvMonthly = (months: number) => (months <= 0 ? 0 : (100 * ((1 + 0.005) ** months - 1)) / 0.005);
const ages = range(10).map((i) => 20 + i * 5);

export const CHARTS: Record<string, Chart> = {
  intro: {
    caption: "Invested at 6% a year, $1,000 could grow to about $1,790 in 10 years (not guaranteed). Under the mattress it stays $1,000, and if prices rise 2% a year it only buys what $820 buys today.",
    art: (
      <Figure
        title="$1,000 over 10 years"
        legend={[
          { name: "Invested at 6% a year", color: C.blue },
          { name: "Under the mattress", color: C.grey },
          { name: "What the mattress money can buy", color: C.orange },
        ]}
      >
        <LineChart
          series={[
            { name: "Invested at 6% a year", color: C.blue, values: range(11).map((y) => 1000 * 1.06 ** y), area: true },
            { name: "Under the mattress", color: C.grey, values: range(11).map(() => 1000) },
            { name: "What the mattress money can buy", color: C.orange, values: range(11).map((y) => 1000 / 1.02 ** y), dashed: true },
          ]}
          xLabels={range(11).map((y) => (y === 0 ? "Today" : `Yr ${y}`))}
          yMin={600}
          yMax={1800}
          fmt={dollars}
        />
      </Figure>
    ),
  },

  stocks: {
    caption: "Split the coffee shop into 1,000 shares. Buy 10 and you own 1% of it, so you get 1% of its success (or its losses).",
    art: (
      <Figure title="Who owns the coffee shop?" legend={[{ name: "Your 10 shares", color: C.orange }, { name: "The other 990 shares", color: C.grey }]}>
        <svg viewBox="0 0 600 220" className="chart-svg" role="img" aria-label="You own 1% of the shop">
          <Donut cx={170} cy={110} size={210} parts={[{ name: "Your 10 shares", value: 10, color: C.orange }, { name: "The other 990 shares", value: 990, color: "#e6e6e6" }]} center="1%" sub="is yours" />
          <text x={330} y={80} fontSize={15} fill={C.text}>Shop gets more customers</text>
          <text x={330} y={102} fontSize={14} fontWeight={700} fill={C.aqua}>↑ your shares are worth more</text>
          <text x={330} y={150} fontSize={15} fill={C.text}>Shop loses customers</text>
          <text x={330} y={172} fontSize={14} fontWeight={700} fill={C.red}>↓ your shares are worth less</text>
        </svg>
      </Figure>
    ),
  },

  etfs: {
    caption: "One stock puts all your money in one company. One ETF spreads it over hundreds, so no single company can sink you.",
    art: (
      <Figure title="What you own with $100" legend={[{ name: "One stock", color: C.orange }, { name: "One ETF (each tile = a company)", color: C.blue }]}>
        <div className="chart-split">
          <div>
            <p className="chart-sub">Buy 1 stock</p>
            <Mosaic tiles={[]} block={{ label: "1 company", color: C.orange, rows: 4 }} />
          </div>
          <div>
            <p className="chart-sub">Buy 1 ETF</p>
            <Mosaic
              cols={10}
              tiles={range(40).map((i) => ({ label: "", color: [C.blue, "#5b97e0", "#87b3ea", "#3d84da"][i % 4] }))}
            />
            <p className="chart-note">...and hundreds more</p>
          </div>
        </div>
      </Figure>
    ),
  },

  bonds: {
    caption: "Lend $100 for 5 years at 5%: you get $5 every year, then your $100 back at the end.",
    art: (
      <Figure title="What a $100 bond pays you" legend={[{ name: "Interest", color: C.blue }, { name: "Your money back", color: C.orange }]}>
        <Columns
          max={110}
          fmt={dollars}
          items={[1, 2, 3, 4, 5].map((y) => ({
            label: `Year ${y}`,
            parts: y < 5 ? [{ name: "Interest", value: 5, color: C.blue }] : [{ name: "Your money back", value: 100, color: C.orange }, { name: "Interest", value: 5, color: C.blue }],
          }))}
        />
      </Figure>
    ),
  },

  gics: {
    caption: "Lock $1,000 for 2 years at 4%. The amount grows by a known amount each year: about $1,082 at the end.",
    art: (
      <Figure title="A $1,000 GIC at 4% a year" legend={[{ name: "Your $1,000", color: C.grey }, { name: "Interest earned", color: C.aqua }]}>
        <Columns
          max={1150}
          fmt={dollars}
          items={[
            { label: "Today", parts: [{ name: "Your $1,000", value: 1000, color: C.grey }] },
            { label: "After 1 year", parts: [{ name: "Your $1,000", value: 1000, color: C.grey }, { name: "Interest earned", value: 40, color: C.aqua }] },
            { label: "After 2 years", parts: [{ name: "Your $1,000", value: 1000, color: C.grey }, { name: "Interest earned", value: 81.6, color: C.aqua }] },
          ]}
        />
      </Figure>
    ),
  },

  reits: {
    caption: "A REIT owns the buildings, collects the rent, and passes part of it to everyone who owns a share.",
    art: (
      <Figure title="How rent reaches you">
        <Flow
          steps={[
            { title: "Tenants", text: "pay rent every\nmonth", color: C.grey },
            { title: "The REIT", text: "owns the buildings,\npays the costs", color: C.blue },
            { title: "You", text: "get a share of the\nrent (distribution)", color: C.aqua },
          ]}
        />
      </Figure>
    ),
  },

  crypto: {
    caption: "Crypto can jump 10% one day and drop 15% the next. A broad ETF usually moves much less day to day.",
    art: (
      <Figure title="Two weeks of price moves (illustration)" legend={[{ name: "Crypto", color: C.orange }, { name: "Broad stock ETF", color: C.blue }]}>
        <LineChart
          series={[
            { name: "Crypto", color: C.orange, values: [100, 110, 94, 105, 91, 103, 118, 100, 112, 96, 104, 99, 113, 107] },
            { name: "Broad stock ETF", color: C.blue, values: [100, 100.6, 100.1, 101, 100.7, 101.4, 101.9, 101.2, 102, 101.6, 102.3, 102.1, 102.8, 103] },
          ]}
          xLabels={range(14).map((d) => `Day ${d + 1}`)}
          yMin={80}
          yMax={120}
          fmt={(n) => `$${Math.round(n)}`}
        />
      </Figure>
    ),
  },

  mutual_funds: {
    caption: "Ten friends put $100 each into one pot. A manager invests the $1,000, and each friend owns 10% of whatever it becomes.",
    art: (
      <Figure title="One pot, many owners" legend={[{ name: "Your $100 (10%)", color: C.orange }, { name: "Your friends' money", color: C.blue }]}>
        <svg viewBox="0 0 600 220" className="chart-svg" role="img" aria-label="Ten equal slices, one is yours">
          <Donut
            cx={170}
            cy={110}
            size={210}
            parts={range(10).map((i) => ({ name: i === 0 ? "Your $100 (10%)" : `Friend ${i}`, value: 100, color: i === 0 ? C.orange : C.blue }))}
            center="$1,000"
            sub="in the pot"
          />
          <text x={330} y={92} fontSize={15} fill={C.text}>A professional manager</text>
          <text x={330} y={114} fontSize={15} fill={C.text}>invests the whole pot.</text>
          <text x={330} y={150} fontSize={14} fontWeight={700} fill={C.text2}>The fund charges a yearly fee.</text>
        </svg>
      </Figure>
    ),
  },

  fees: {
    caption: "Same $10,000, same 6% growth, 25 years. The only difference is the fee: about $40,500 vs $26,700.",
    art: (
      <Figure title="$10,000 over 25 years" legend={[{ name: "0.25% fee", color: C.blue }, { name: "2% fee", color: C.orange }]}>
        <LineChart
          series={[
            { name: "0.25% fee", color: C.blue, values: range(26).map((y) => 10000 * 1.0575 ** y), area: true },
            { name: "2% fee", color: C.orange, values: range(26).map((y) => 10000 * 1.04 ** y) },
          ]}
          xLabels={range(26).map((y) => (y % 5 === 0 ? `Yr ${y}` : ""))}
          yMax={45000}
          fmt={kDollars}
        />
      </Figure>
    ),
  },

  risk_return: MORE.risk_return,

  volatility: {
    caption: "Markets drop and recover. Selling at the bottom locks in the loss; staying invested gave you the recovery.",
    art: (
      <Figure title="A bumpy ride (illustration)" legend={[{ name: "Stayed invested", color: C.blue }, { name: "Sold in a panic", color: C.orange }]}>
        <LineChart
          series={[
            { name: "Stayed invested", color: C.blue, values: [100, 106, 111, 104, 92, 81, 78, 86, 95, 103, 110, 117], area: true },
            { name: "Sold in a panic", color: C.orange, values: [100, 106, 111, 104, 92, 81, 78, 78, 78, 78, 78, 78], dashed: true },
          ]}
          xLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
          yMin={60}
          yMax={120}
          fmt={(n) => `$${Math.round(n)}`}
          marks={[{ i: 6, s: 1, label: "Sold here" }]}
        />
      </Figure>
    ),
  },

  investor_profile: {
    caption: "Example mixes for each profile. The more you can stay calm during drops, the more stocks you can usually hold.",
    art: (
      <Figure title="Example mixes by profile" legend={[{ name: "Stocks", color: C.blue }, { name: "Bonds", color: C.aqua }, { name: "Cash", color: C.yellow }]}>
        <SplitBars
          rows={[
            { label: "Conservative", parts: [{ name: "Stocks", value: 25, color: C.blue }, { name: "Bonds", value: 65, color: C.aqua }, { name: "Cash", value: 10, color: C.yellow }] },
            { label: "Balanced", parts: [{ name: "Stocks", value: 50, color: C.blue }, { name: "Bonds", value: 45, color: C.aqua }, { name: "Cash", value: 5, color: C.yellow }] },
            { label: "Growth", parts: [{ name: "Stocks", value: 80, color: C.blue }, { name: "Bonds", value: 20, color: C.aqua }] },
          ]}
        />
      </Figure>
    ),
  },

  diversification: {
    caption: "When one company has a bad year, a portfolio of many companies barely feels it.",
    art: (
      <Figure title="One company vs many (illustration)" legend={[{ name: "All in one company", color: C.orange }, { name: "Spread over many", color: C.blue }]}>
        <LineChart
          series={[
            { name: "All in one company", color: C.orange, values: [100, 104, 108, 96, 80, 66, 60, 63, 65, 68] },
            { name: "Spread over many", color: C.blue, values: [100, 102, 104, 103, 101, 100, 102, 105, 107, 109], area: true },
          ]}
          xLabels={range(10).map((m) => `Month ${m + 1}`)}
          yMin={40}
          yMax={120}
          fmt={(n) => `$${Math.round(n)}`}
        />
      </Figure>
    ),
  },

  asset_allocation: {
    caption: "Like a plate of food, a portfolio is a mix. Example: 60% stocks for growth, 30% bonds for stability, 10% cash for safety.",
    art: (
      <Figure title="An example mix" legend={[{ name: "Stocks 60%", color: C.blue }, { name: "Bonds 30%", color: C.aqua }, { name: "Cash 10%", color: C.yellow }]}>
        <svg viewBox="0 0 600 220" className="chart-svg" role="img" aria-label="60% stocks, 30% bonds, 10% cash">
          <Donut cx={170} cy={110} size={210} parts={[{ name: "Stocks", value: 60, color: C.blue }, { name: "Bonds", value: 30, color: C.aqua }, { name: "Cash", value: 10, color: C.yellow }]} center="60/30/10" />
          {[
            ["Stocks 60%", "growth, bigger ups and downs", C.blue],
            ["Bonds 30%", "steadier, smaller returns", C.aqua],
            ["Cash 10%", "safe and ready to use", C.yellow],
          ].map(([t, d, c], i) => (
            <g key={t}>
              <rect x={330} y={58 + i * 46} width={12} height={12} rx={3} fill={c} />
              <text x={352} y={69 + i * 46} fontSize={15} fontWeight={700} fill={C.text}>{t}</text>
              <text x={352} y={88 + i * 46} fontSize={13} fill={C.text2}>{d}</text>
            </g>
          ))}
        </svg>
      </Figure>
    ),
  },

  analyze_portfolio: {
    caption: "In this example, 70% sits in two bank stocks. Anything above about 25% in one company is worth a second look.",
    art: (
      <Figure title="Example account: what you own">
        <HBars
          max={50}
          fmt={pct}
          refLine={{ value: 25, label: "25%: worth a second look" }}
          items={[
            { label: "Bank A", value: 40, color: C.orange },
            { label: "Bank B", value: 30, color: C.orange },
            { label: "World ETF", value: 20, color: C.blue },
            { label: "Cash", value: 10, color: C.grey },
          ]}
        />
      </Figure>
    ),
  },

  goals_horizon: {
    caption: "The longer until you need the money, the more ups and downs you can ride out.",
    art: (
      <Figure title="When do you need the money?">
        <HBars
          max={32}
          fmt={(n) => `${n} yr${n > 1 ? "s" : ""}`}
          items={[
            { label: "Trip next summer", value: 1, color: C.aqua },
            { label: "Car in 4 years", value: 4, color: C.yellow },
            { label: "Retirement", value: 30, color: C.blue },
          ]}
        />
        <div className="chart-scale">
          <span>Keep it safe: savings, GIC</span>
          <span>Can invest in stocks</span>
        </div>
      </Figure>
    ),
  },

  compound_growth: {
    caption: "$100 a month at 6% a year. Starting at 20 instead of 35 ends with almost 3 times more at 65.",
    art: (
      <Figure title="$100 a month until age 65" legend={[{ name: "Start at 20", color: C.blue }, { name: "Start at 35", color: C.orange }]}>
        <LineChart
          series={[
            { name: "Start at 20", color: C.blue, values: ages.map((a) => fvMonthly((a - 20) * 12)), area: true },
            { name: "Start at 35", color: C.orange, values: ages.map((a) => fvMonthly((a - 35) * 12)) },
          ]}
          xLabels={ages.map((a) => `Age ${a}`)}
          yMax={300000}
          fmt={kDollars}
        />
      </Figure>
    ),
  },

  dollar_cost_averaging: {
    caption: "The same $100 every month. When the price is low, it buys more units, without you guessing the right moment.",
    art: (
      <Figure title="$100 every month" legend={[{ name: "Units you get", color: C.blue }]}>
        <Columns
          max={12}
          items={[
            { label: "Jan: $20 each", parts: [{ name: "Units you get", value: 5, color: C.blue }], top: "5 units" },
            { label: "Feb: $10 each", parts: [{ name: "Units you get", value: 10, color: C.blue }], top: "10 units" },
            { label: "Mar: $25 each", parts: [{ name: "Units you get", value: 4, color: C.blue }], top: "4 units" },
          ]}
        />
      </Figure>
    ),
  },

  rebalancing: {
    caption: "After a great year, stocks grew to 70% of the mix. Selling a little and buying bonds brings you back to the 60/40 plan.",
    art: (
      <Figure title="Getting back to your plan" legend={[{ name: "Stocks", color: C.blue }, { name: "Bonds", color: C.aqua }]}>
        <SplitBars
          rows={[
            { label: "Your plan", parts: [{ name: "Stocks", value: 60, color: C.blue }, { name: "Bonds", value: 40, color: C.aqua }] },
            { label: "After a great year", parts: [{ name: "Stocks", value: 70, color: C.blue }, { name: "Bonds", value: 30, color: C.aqua }] },
            { label: "After rebalancing", parts: [{ name: "Stocks", value: 60, color: C.blue }, { name: "Bonds", value: 40, color: C.aqua }] },
          ]}
        />
      </Figure>
    ),
  },

  hype_fomo: {
    caption: "By the time everyone is talking about it, the price has often already shot up. Buying at the top can mean a quick 50% drop.",
    art: (
      <Figure title="A hyped coin (illustration)">
        <LineChart
          series={[{ name: "Price", color: C.orange, values: [10, 11, 12, 14, 19, 27, 40, 34, 26, 22, 20, 19], area: true }]}
          xLabels={range(12).map((w) => `Week ${w + 1}`)}
          yMax={45}
          fmt={(n) => `$${Math.round(n)}`}
          marks={[{ i: 6, s: 0, label: "Everyone buys here" }]}
          endLabels={false}
        />
      </Figure>
    ),
  },

  registered_accounts: {
    caption: "Three accounts with different tax breaks. Each one has a yearly limit (contribution room), and the rules change, so check Canada.ca.",
    art: (
      <Figure title="TFSA, RRSP and FHSA at a glance">
        <CompareTable
          cols={[
            { name: "TFSA", color: C.blue },
            { name: "RRSP", color: C.aqua },
            { name: "FHSA", color: C.yellow },
          ]}
          rows={[
            { label: "Lowers your taxes now", cells: ["No", "Yes", "Yes"] },
            { label: "Growth is taxed", cells: ["No", "Later", "No (for a first home)"] },
            { label: "Best for", cells: ["Any goal", "Retirement", "Your first home"] },
          ]}
        />
      </Figure>
    ),
  },

  investment_taxes: {
    caption: "A $20 gain in a regular account can be partly taxed. Example: half the gain is taxable, at a 30% tax rate that's about $3. In a TFSA you keep all $20.",
    art: (
      <Figure title="A $20 gain (buy at $50, sell at $70)" legend={[{ name: "You keep", color: C.aqua }, { name: "Tax (example)", color: C.orange }]}>
        <HBars
          max={22}
          fmt={(n) => `$${n}`}
          items={[
            { label: "Regular account", value: 17, color: C.aqua },
            { label: "...tax (example)", value: 3, color: C.orange },
            { label: "TFSA", value: 20, color: C.aqua },
          ]}
        />
      </Figure>
    ),
  },

  market_index: {
    caption: "An index is the average of many companies, like a class average. Some go up, some go down, and the index shows the overall direction.",
    art: (
      <Figure title="Many companies, one score (illustration)" legend={[{ name: "Each company", color: C.grey }, { name: "The index (average)", color: C.blue }]}>
        <LineChart
          series={[
            { name: "Company A", color: "#d9d9d9", values: [100, 104, 101, 108, 112, 109, 115] },
            { name: "Company B", color: "#d9d9d9", values: [100, 97, 95, 98, 94, 96, 99] },
            { name: "Company C", color: "#d9d9d9", values: [100, 102, 106, 104, 109, 113, 111] },
            { name: "Company D", color: "#d9d9d9", values: [100, 99, 103, 101, 100, 104, 107] },
            { name: "The index (average)", color: C.blue, values: [100, 100.5, 101.3, 102.8, 103.8, 105.5, 108] },
          ]}
          xLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue"]}
          yMin={90}
          yMax={120}
          fmt={(n) => `${Math.round(n)}`}
          endLabels={false}
        />
      </Figure>
    ),
  },

  bull_bear: {
    caption: "A bull strikes UP with its horns: prices keep rising. A bear swipes DOWN with its paws: prices fall 20% or more.",
    art: (
      <Figure title="Bull vs bear market (illustration)" legend={[{ name: "Bull market", color: C.aqua }, { name: "Bear market", color: C.orange }]}>
        <LineChart
          series={[
            { name: "Bull market", color: C.aqua, values: [100, 103, 101, 106, 110, 108, 114, 119, 117, 124], area: true },
            { name: "Bear market", color: C.orange, values: [100, 97, 99, 93, 88, 90, 84, 80, 82, 76] },
          ]}
          xLabels={range(10).map((m) => `Month ${m + 1}`)}
          yMin={60}
          yMax={130}
          fmt={(n) => `${Math.round(n) - 100 >= 0 ? "+" : ""}${Math.round(n) - 100}%`}
        />
      </Figure>
    ),
  },

  research: {
    caption: "Before buying, answer five questions. If you can't answer one simply, learn more first.",
    art: (
      <Figure title="Your 5-question check">
        <Flow
          steps={[
            { title: "1. What?", text: "What is it?", color: C.blue },
            { title: "2. How?", text: "How does it\nmake money?", color: C.blue },
            { title: "3. Risk?", text: "What could\ngo wrong?", color: C.orange },
          ]}
        />
        <Flow
          steps={[
            { title: "4. Cost?", text: "What are\nthe fees?", color: C.yellow },
            { title: "5. Fit?", text: "Does it fit\nmy goal?", color: C.aqua },
          ]}
        />
      </Figure>
    ),
  },

  simulation: {
    caption: "Practice with pretend money on real-looking prices, including the scary drops, without risking a cent.",
    art: (
      <Figure title="Practice mode: pretend $10,000 (illustration)">
        <LineChart
          series={[{ name: "Pretend portfolio", color: C.violet, values: [10000, 10600, 11400, 12100, 9800, 10900, 12400, 13300, 12700, 14200, 15100], area: true }]}
          xLabels={range(11).map((y) => `${y === 0 ? "Start" : `Yr ${y / 2}`}`)}
          yMin={8000}
          yMax={16000}
          fmt={kDollars}
          marks={[{ i: 4, s: 0, label: "A scary drop" }]}
        />
      </Figure>
    ),
  },
};
