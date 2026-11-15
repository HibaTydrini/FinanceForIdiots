// Explainer pictures shown on the "See it" slide of a topic.
// Each one is a small hand-made SVG drawing, keyed by the topic id
// from data/learningPath.json. A topic without a drawing just skips that slide.
// The pieces (food, basket, coins, animals...) are in drawingParts.tsx.

import type { ReactElement } from "react";
import { RED, PINK, GREEN, GREEN_BG, GREY, INK, OUTLINE, LINE } from "./drawingColors";
import {
  Arrow,
  Tag,
  Tomato,
  Carrot,
  Pepper,
  Banana,
  Strawberry,
  Corn,
  Leaves,
  Basket,
  BasketHandle,
  Egg,
  BrokenEgg,
  Coins,
  Bull,
  Bear,
} from "./drawingParts";
import { MORE } from "./moreIllustrations";

type Illustration = { caption: string; art: ReactElement };

const etfs: Illustration = {
  caption: "One share = one ingredient. An ETF = the whole basket, so you get a bit of everything in one buy.",
  art: (
    <svg viewBox="0 -30 600 300" role="img" aria-label="Single vegetables are individual shares, a full basket of food is an ETF">
      <Tomato x={60} y={150} s={1.2} />
      <Carrot x={135} y={150} s={1.15} rotate={25} />
      <Pepper x={210} y={152} s={1.15} />
      <text x={60} y={200} textAnchor="middle" fontSize={13} fill={GREY}>
        Apple
      </text>
      <text x={135} y={200} textAnchor="middle" fontSize={13} fill={GREY}>
        Shopify
      </text>
      <text x={210} y={200} textAnchor="middle" fontSize={13} fill={GREY}>
        Royal Bank
      </text>
      <Tag x={135} y={245} w={210} text="INDIVIDUAL SHARES" />

      <text x={300} y={160} textAnchor="middle" fontSize={20} fontWeight={800} fill={GREY}>
        vs
      </text>

      {/* handle and food first, so the basket front covers them */}
      <BasketHandle x={350} y={105} w={210} />
      <Leaves x={372} y={92} s={1.3} />
      <Corn x={500} y={72} s={1.1} rotate={18} />
      <Leaves x={530} y={96} s={1.2} />
      <Tomato x={400} y={95} s={1.05} />
      <Banana x={458} y={92} s={1} rotate={-8} />
      <Pepper x={510} y={100} s={0.95} />
      <Carrot x={440} y={80} s={0.9} rotate={-30} />
      <Basket x={350} y={105} w={210} />
      <Strawberry x={548} y={210} s={0.9} />
      <Tag x={455} y={245} w={90} text="ETF" />
    </svg>
  ),
};

// $100 a month at 6%: value at each age (checked with the compound-interest formula).
const growth = [
  { age: 35, early: 29082, late: 0 },
  { age: 45, early: 69299, late: 16388 },
  { age: 55, early: 142471, late: 46204 },
  { age: 65, early: 275599, late: 100452 },
];
const money = (n: number) => (n === 0 ? "$0" : `$${Math.round(n / 1000)}k`);
const coins = (n: number) => (n === 0 ? 0 : Math.max(1, Math.round(n / 20000)));

const compound_growth: Illustration = {
  caption: "$100 a month at 6% a year. Each coin is about $20k. Starting at 20 instead of 35 ends with almost 3 times more.",
  art: (
    <svg viewBox="0 0 600 280" role="img" aria-label="Coin stacks: starting at 20 grows to $276k by 65, starting at 35 grows to $100k">
      <line x1={40} y1={232} x2={580} y2={232} stroke={LINE} strokeWidth={OUTLINE} strokeLinecap="round" />
      {growth.map((g, i) => {
        const x = 95 + i * 135;
        const ce = coins(g.early);
        const cl = coins(g.late);
        return (
          <g key={g.age}>
            <Coins x={x - 22} y={226} count={ce} />
            <Coins x={x + 22} y={226} count={cl} color="#d9d9d9" />
            <text x={x - 22} y={210 - ce * 9} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
              {money(g.early)}
            </text>
            <text x={x + 22} y={210 - cl * 9} textAnchor="middle" fontSize={12} fill={GREY}>
              {money(g.late)}
            </text>
            <text x={x} y={258} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>
              Age {g.age}
            </text>
          </g>
        );
      })}
      <circle cx={52} cy={24} r={8} fill="#f5c542" stroke={LINE} strokeWidth={2.5} />
      <text x={66} y={29} fontSize={14} fontWeight={700} fill={INK}>
        Started at 20
      </text>
      <circle cx={190} cy={24} r={8} fill="#d9d9d9" stroke={LINE} strokeWidth={2.5} />
      <text x={204} y={29} fontSize={14} fill={INK}>
        Started at 35
      </text>
    </svg>
  ),
};

const bullLine = "30,200 80,175 115,185 160,140 200,150 240,100 272,70";
const bearLine = "330,80 370,95 405,85 445,130 480,120 525,170 568,200";

const bull_bear: Illustration = {
  caption: "A bull strikes UP with its horns: prices rise. A bear swipes DOWN with its paws: prices fall.",
  art: (
    <svg viewBox="0 0 600 270" role="img" aria-label="A charging bull next to a rising price line, a bear next to a falling price line">
      <rect x={8} y={8} width={284} height={254} rx={14} fill={GREEN_BG} stroke={LINE} strokeWidth={OUTLINE} />
      <Tag x={92} y={42} w={140} text="BULL MARKET" />
      <text x={30} y={76} fontSize={14} fontWeight={700} fill={GREEN}>
        Prices go UP
      </text>
      <polyline points={bullLine} fill="none" stroke={GREEN} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.45} />
      <Arrow x1={262} y1={80} x2={276} y2={62} color={GREEN} />
      <Bull x={40} y={128} s={1.0} />

      <rect x={308} y={8} width={284} height={254} rx={14} fill={PINK} stroke={LINE} strokeWidth={OUTLINE} />
      <Tag x={508} y={42} w={144} text="BEAR MARKET" />
      <text x={570} y={76} textAnchor="end" fontSize={14} fontWeight={700} fill={RED}>
        Prices go DOWN
      </text>
      <polyline points={bearLine} fill="none" stroke={RED} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.45} />
      <Arrow x1={556} y1={190} x2={572} y2={204} color={RED} />
      <Bear x={340} y={130} s={1.0} />
    </svg>
  ),
};

const diversification: Illustration = {
  caption: "Don't put all your eggs in one basket. If one investment drops, the others keep you safe.",
  art: (
    <svg viewBox="0 0 600 270" role="img" aria-label="One dropped basket breaks every egg; with three baskets only one basket's eggs break">
      <Tag x={145} y={30} w={210} text="ALL IN ONE BASKET" />
      <g transform="rotate(-18 140 150)">
        <Basket x={70} y={110} w={140} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <BrokenEgg key={i} x={55 + i * 62} y={222} s={0.9} />
      ))}
      <text x={145} y={258} textAnchor="middle" fontSize={14} fontWeight={800} fill={RED}>
        It falls: you lose everything
      </text>

      <line x1={300} y1={20} x2={300} y2={250} stroke="#dddddd" strokeWidth={2} />

      <Tag x={450} y={30} w={130} text="SPREAD OUT" />
      {[0, 1, 2].map((b) => {
        const x = 328 + b * 86;
        if (b === 0) {
          return (
            <g key={b}>
              <g transform={`rotate(-18 ${x + 36} 140)`}>
                <Basket x={x} y={120} w={72} />
              </g>
              <BrokenEgg x={x + 36} y={222} s={0.75} />
            </g>
          );
        }
        return (
          <g key={b}>
            <Egg x={x + 24} y={118} s={0.9} />
            <Egg x={x + 48} y={118} s={0.9} />
            <Basket x={x} y={128} w={72} />
          </g>
        );
      })}
      <text x={450} y={258} textAnchor="middle" fontSize={14} fontWeight={800} fill={GREEN}>
        One falls: you only lose a little
      </text>
    </svg>
  ),
};

// Only the drawings nini liked are shown. The others stay here in case we want them back.
const UNUSED = { etfs, compound_growth, bull_bear, diversification };
void UNUSED;

export const ILLUSTRATIONS: Record<string, Illustration> = {
  risk_return: MORE.risk_return,
};
