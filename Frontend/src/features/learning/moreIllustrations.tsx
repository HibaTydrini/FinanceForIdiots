// More explainer pictures (one per topic), same style as illustrations.tsx.
// Numbers match the examples in data/learningPath.json.

import type { ReactElement } from "react";
import { RED, PINK, GREEN, GREEN_BG, GREY, INK, OUTLINE, LINE } from "./drawingColors";
import {
  Arrow,
  Tag,
  Label,
  Person,
  Coin,
  Coins,
  Bill,
  MoneyPlant,
  Mattress,
  Columns,
  Building,
  Shop,
  Lock,
  Car,
  Bike,
  Flag,
  Magnifier,
  Megaphone,
  AccountBox,
  Screen,
  Plate,
  Pot,
  Calendar,
  Egg,
  Basket,
  ColorLine,
  Pie,
  MoneyBits,
} from "./drawingParts";

type Illustration = { caption: string; art: ReactElement };

const STOCK = "#e8452c";
const BOND = "#4a7fd4";
const CASH = "#5bbf6a";

export const MORE: Record<string, Illustration> = {
  intro: {
    caption: "$1,000 under the mattress is still $1,000 in 10 years, and it buys less. Invested at 6% a year, it could become about $1,790 (not guaranteed).",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Money under a mattress stays the same; invested money grows like a plant">
        <Tag x={150} y={30} w={230} text="UNDER THE MATTRESS" />
        <Bill x={150} y={118} s={1.3} text="$1,000" rotate={-8} />
        <Mattress x={150} y={160} />
        <Label x={150} y={215} text="In 10 years: still $1,000" bold />
        <Label x={150} y={235} text="but groceries cost more" color={GREY} />

        <text x={300} y={140} textAnchor="middle" fontSize={20} fontWeight={800} fill={GREY}>
          vs
        </text>

        <Tag x={450} y={30} w={120} text="INVESTED" />
        <MoneyPlant x={450} y={150} s={0.9} />
        <Label x={450} y={215} text="In 10 years: about $1,790" bold color={GREEN} />
        <Label x={450} y={235} text="if it grows 6% a year" color={GREY} />
      </svg>
    ),
  },

  stocks: {
    caption: "Split a coffee shop into 1,000 pieces and buy 10: you own 1%. More customers, your pieces are worth more. Fewer customers, worth less.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A coffee shop split into pieces; you own a few">
        <Tag x={150} y={30} w={200} text="THE COFFEE SHOP" />
        <Shop x={150} y={215} />
        <Label x={150} y={245} text="1,000 equal pieces (shares)" color={GREY} />

        <Arrow x1={250} y1={140} x2={300} y2={140} />

        <g>
          {Array.from({ length: 50 }, (_, i) => (
            <rect key={i} x={320 + (i % 10) * 16} y={60 + Math.floor(i / 10) * 16} width={13} height={13} rx={2} fill={i === 0 ? "#f5c542" : "#eeeeee"} stroke={i === 0 ? INK : "#cccccc"} strokeWidth={i === 0 ? 2.5 : 1} />
          ))}
        </g>
        <Label x={400} y={160} text="You buy 10 pieces = 1%" bold />
        <Label x={360} y={200} text="More customers" color={GREEN} bold />
        <Arrow x1={360} y1={240} x2={360} y2={212} color={GREEN} />
        <Label x={470} y={200} text="Fewer customers" color={RED} bold />
        <Arrow x1={470} y1={212} x2={470} y2={240} color={RED} />
        <Label x={360} y={258} text="pieces worth more" size={12} color={GREY} />
        <Label x={470} y={258} text="pieces worth less" size={12} color={GREY} />
      </svg>
    ),
  },

  bonds: {
    caption: "You lend $100. The borrower pays you $5 every year, then gives your $100 back at the end. That's a bond.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="You lend money to a government, it pays you interest every year and returns the money">
        <Person x={70} y={150} s={1.6} color="#4a7fd4" />
        <Label x={70} y={190} text="You" bold />
        <Bill x={170} y={70} text="$100" />
        <Arrow x1={110} y1={95} x2={230} y2={95} />
        <Label x={170} y={120} text="You lend $100" size={12} color={GREY} />
        <Columns x={300} y={190} />
        <Label x={300} y={212} text="Government or company" bold />

        <Arrow x1={370} y1={150} x2={400} y2={150} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <Coin x={425 + i * 34} y={120} s={0.95} />
            <Label x={425 + i * 34} y={150} text={`Yr ${i + 1}`} size={11} color={GREY} />
          </g>
        ))}
        <Label x={493} y={96} text="$5 interest every year" bold color={GREEN} />
        <Bill x={493} y={190} text="$100 back" s={1.15} />
        <Label x={493} y={228} text="...and your money back at the end" size={12} color={GREY} />
      </svg>
    ),
  },

  gics: {
    caption: "Lock $1,000 at the bank for 2 years at 4%. You get it back with interest, about $1,082. No surprises, but you can't take it out early.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Money locked for two years comes back with interest">
        <Bill x={80} y={130} s={1.3} text="$1,000" />
        <Label x={80} y={180} text="You put in" color={GREY} />
        <Arrow x1={135} y1={130} x2={190} y2={130} />
        <Columns x={290} y={200} color="#e7eefc" />
        <Lock x={290} y={110} s={0.8} />
        <Tag x={290} y={235} w={170} text="LOCKED 2 YEARS" />
        <Arrow x1={370} y1={130} x2={425} y2={130} />
        <Bill x={500} y={120} s={1.3} text="$1,000" />
        <Coin x={548} y={150} />
        <Coin x={530} y={160} />
        <Label x={500} y={195} text="You get back about $1,082" bold color={GREEN} />
        <Label x={500} y={215} text="(4% a year, guaranteed)" size={12} color={GREY} />
      </svg>
    ),
  },

  reits: {
    caption: "A REIT owns lots of buildings. Tenants pay rent, and part of it comes back to you, even if you only own one share.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Rent from apartments, offices and shops flows to you">
        <Building x={70} y={190} w={70} h={130} color="#f0b860" />
        <Building x={150} y={190} w={64} h={160} color="#9cc7f0" />
        <Building x={232} y={190} w={80} h={100} color="#f3a5a0" />
        <line x1={20} y1={190} x2={280} y2={190} stroke={LINE} strokeWidth={OUTLINE} strokeLinecap="round" />
        <Label x={150} y={215} text="Apartments, offices, shops" bold />
        <Label x={150} y={235} text="owned by the REIT" color={GREY} />

        <Coin x={330} y={110} />
        <Coin x={360} y={128} />
        <Coin x={390} y={110} />
        <Arrow x1={300} y1={150} x2={440} y2={150} color={GREEN} />
        <Label x={370} y={178} text="Rent comes in" color={GREEN} bold />
        <Person x={500} y={160} s={1.6} color="#46b552" />
        <Label x={500} y={200} text="You get a share" bold />
        <Label x={500} y={220} text="of the rent" color={GREY} />
      </svg>
    ),
  },

  crypto: {
    caption: "A digital coin with no bank in charge. Its price is whatever people will pay, so it can jump 10% one day and drop 15% the next.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A bitcoin with a very bumpy price line">
        <g transform="translate(100 135)">
          <circle r={70} fill="#f7a531" stroke={LINE} strokeWidth={OUTLINE} />
          <circle r={56} fill="none" stroke="#d98a1c" strokeWidth={4} />
          <text y={26} textAnchor="middle" fontSize={76} fontWeight={800} fill="white" stroke={LINE} strokeWidth={2.5}>
            ₿
          </text>
        </g>
        <Label x={100} y={240} text="Bitcoin, Ether..." bold />

        <rect x={210} y={20} width={370} height={220} rx={14} fill={PINK} stroke={LINE} strokeWidth={OUTLINE} />
        <ColorLine points="230,170 270,120 300,150 330,70 370,190 410,110 450,160 490,60 530,200 560,140" color={RED} />
        <Tag x={330} y={52} w={70} text="+10%" />
        <Tag x={370} y={222} w={70} text="-15%" />
        <Label x={500} y={225} text="One day vs the next" color={GREY} size={12} />
      </svg>
    ),
  },

  mutual_funds: {
    caption: "Lots of people put money into one pot. An expert manager invests it, and each person owns their share of the pot.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Many people put coins into one pot managed by an expert">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <Person x={60 + i * 70} y={60} s={1.1} color={["#4a7fd4", "#46b552", "#e8452c", "#f5a623", "#9b59b6"][i]} />
            <Coin x={60 + i * 70} y={95} s={0.8} />
            <Arrow x1={60 + i * 70} y1={110} x2={200 + (i - 2) * 30} y2={145} color={GREY} />
          </g>
        ))}
        <Pot x={200} y={160} />
        <Coins x={180} y={170} count={2} />
        <Coins x={220} y={170} count={3} />
        <Label x={200} y={260} text="The fund (one big pot)" bold />

        <Person x={480} y={200} s={1.8} color="#2f3446" />
        <path d="M480 172 l-5 10 l5 14 l5 -14 z" fill={RED} />
        <rect x={405} y={60} width={150} height={80} rx={8} fill="white" stroke={LINE} strokeWidth={OUTLINE} />
        <ColorLine points="420,125 450,110 475,118 505,90 540,75" color={GREEN} />
        <Label x={480} y={236} text="An expert invests it" bold />
        <Label x={480} y={256} text="(and charges a yearly fee)" size={12} color={GREY} />
      </svg>
    ),
  },

  fees: {
    caption: "Same $10,000, same 6% growth, 25 years. A 0.25% fee leaves about $40,500. A 2% fee leaves about $26,700.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Low fee coin stack is much taller than high fee coin stack">
        <line x1={60} y1={225} x2={540} y2={225} stroke={LINE} strokeWidth={OUTLINE} strokeLinecap="round" />
        <Coins x={180} y={219} count={16} />
        <Label x={180} y={58} text="$40,500" bold size={16} />
        <Tag x={180} y={256} w={150} text="0.25% FEE" />
        <Coins x={420} y={219} count={11} color="#d9d9d9" />
        <Label x={420} y={103} text="$26,700" bold size={16} color={GREY} />
        <Tag x={420} y={256} w={130} text="2% FEE" />
        <Label x={300} y={100} text="the fee ate" color={RED} />
        <Label x={300} y={120} text="about $13,800" color={RED} bold />
        <Arrow x1={350} y1={110} x2={395} y2={110} color={RED} />
      </svg>
    ),
  },

  risk_return: {
    caption: "Safe is slow, like a bike. Fast can crash, like a sports car. Pick the speed you're comfortable with.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A bike is slow and safe, a sports car is fast but can crash">
        <Tag x={150} y={30} w={170} text="SAVINGS / GIC" />
        <Bike x={150} y={130} s={1.4} />
        <Label x={150} y={200} text="Slow growth" bold />
        <Label x={150} y={220} text="Low risk" color={GREEN} bold />

        <line x1={300} y1={30} x2={300} y2={240} stroke="#dddddd" strokeWidth={2} />

        <Tag x={450} y={30} w={100} text="STOCKS" />
        <Car x={450} y={135} s={1.4} />
        <path d="M360 120 h-30 M360 140 h-40 M360 160 h-28" stroke={GREY} strokeWidth={4} strokeLinecap="round" />
        <Label x={450} y={200} text="Fast growth" bold />
        <Label x={450} y={220} text="Higher risk of a crash" color={RED} bold />
      </svg>
    ),
  },

  volatility: {
    caption: "Markets are like a roller coaster. Drops are scary, but people who jump off at the bottom (panic-sell) lock in their losses.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A roller coaster track going up and down, ending higher">
        <path d="M30 180 C80 60 130 60 170 130 S240 230 290 170 S360 40 420 110 S500 150 560 80" fill="none" stroke={LINE} strokeWidth={12} strokeLinecap="round" />
        <path d="M30 180 C80 60 130 60 170 130 S240 230 290 170 S360 40 420 110 S500 150 560 80" fill="none" stroke="#f5a623" strokeWidth={6} strokeLinecap="round" />
        <path d="M30 180 C80 60 130 60 170 130 S240 230 290 170 S360 40 420 110 S500 150 560 80" fill="none" stroke={LINE} strokeWidth={1.5} strokeDasharray="6 10" />
        <g transform="translate(232 200) rotate(4)">
          <rect x={-22} y={-22} width={44} height={22} rx={6} fill={RED} stroke={LINE} strokeWidth={OUTLINE} />
          <circle cx={-12} cy={2} r={5} fill={INK} />
          <circle cx={12} cy={2} r={5} fill={INK} />
        </g>
        <Label x={232} y={248} text="Selling here locks in the loss" color={RED} bold />
        <Flag x={560} y={80} color={GREEN} />
        <Label x={440} y={30} text="Stay on: you usually finish higher" color={GREEN} bold />
      </svg>
    ),
  },

  investor_profile: {
    caption: "If your $10,000 dropped to $8,000 in a month, what would you do? Your honest answer hints at your profile.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Three choices: sell, wait or buy more, matching conservative, balanced and growth profiles">
        <Label x={300} y={30} text="Your $10,000 drops to $8,000. You..." bold size={16} />
        {[
          { x: 100, word: "SELL", who: "Conservative", color: BOND, bg: "#e7eefc" },
          { x: 300, word: "WAIT", who: "Balanced", color: "#f5a623", bg: "#fff5e0" },
          { x: 500, word: "BUY MORE", who: "Growth", color: GREEN, bg: GREEN_BG },
        ].map((c, i) => (
          <g key={c.word}>
            <rect x={c.x - 85} y={55} width={170} height={190} rx={14} fill={c.bg} stroke={LINE} strokeWidth={OUTLINE} />
            <g transform={`translate(${c.x} 140)`}>
              <path d="M-44 0 A44 44 0 0 1 44 0" fill="none" stroke={LINE} strokeWidth={12} strokeLinecap="round" />
              <path d="M-44 0 A44 44 0 0 1 44 0" fill="none" stroke="#dddddd" strokeWidth={7} strokeLinecap="round" />
              <line x1={0} y1={0} x2={-34 + i * 34} y2={-28 + Math.abs(i - 1) * 6} stroke={c.color} strokeWidth={6} strokeLinecap="round" />
              <circle r={7} fill={INK} />
            </g>
            <Label x={c.x} y={190} text={c.word} bold size={18} />
            <Label x={c.x} y={222} text={c.who} bold color={c.color} size={15} />
          </g>
        ))}
      </svg>
    ),
  },

  asset_allocation: {
    caption: "Your portfolio is like a plate: for example 60% stocks, 30% bonds and 10% cash. The mix matters more than any single item.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A plate split into 60% stocks, 30% bonds, 10% cash">
        <Plate x={180} y={135} />
        <Pie cx={180} cy={135} r={58} parts={[[60, STOCK], [30, BOND], [10, CASH]]} />
        <path d="M60 60 v150 M52 60 v30 M68 60 v30 M52 90 q8 10 16 0" fill="none" stroke={GREY} strokeWidth={4} strokeLinecap="round" />
        <path d="M300 60 v150 M300 60 q14 20 0 60" fill="none" stroke={GREY} strokeWidth={4} strokeLinecap="round" />
        {[
          { y: 80, c: STOCK, t: "60% Stocks", d: "growth, bigger ups and downs" },
          { y: 140, c: BOND, t: "30% Bonds", d: "steadier, smaller returns" },
          { y: 200, c: CASH, t: "10% Cash", d: "safe and ready to use" },
        ].map((r) => (
          <g key={r.t}>
            <rect x={350} y={r.y - 16} width={22} height={22} rx={5} fill={r.c} stroke={LINE} strokeWidth={2.5} />
            <text x={384} y={r.y} fontSize={17} fontWeight={800} fill={INK}>
              {r.t}
            </text>
            <text x={384} y={r.y + 20} fontSize={13} fill={GREY}>
              {r.d}
            </text>
          </g>
        ))}
      </svg>
    ),
  },

  analyze_portfolio: {
    caption: "If 70% of your account is in just two bank stocks, that's most of your eggs in one basket. Seeing it as a chart makes it easy to spot.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A portfolio chart where two bank stocks are 70 percent">
        <Screen x={190} y={140} />
        <Pie cx={140} cy={128} r={46} parts={[[40, STOCK], [30, "#f5a623"], [20, BOND], [10, CASH]]} />
        <text x={200} y={100} fontSize={12} fontWeight={800} fill={INK}>
          Bank A 40%
        </text>
        <text x={200} y={120} fontSize={12} fontWeight={800} fill={INK}>
          Bank B 30%
        </text>
        <text x={200} y={140} fontSize={12} fill={GREY}>
          ETF 20%
        </text>
        <text x={200} y={160} fontSize={12} fill={GREY}>
          Cash 10%
        </text>
        <Magnifier x={112} y={175} s={0.8} />

        <Tag x={460} y={60} w={150} text="70% IN 2 BANKS" />
        <Basket x={400} y={130} w={120} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Egg key={i} x={420 + i * 20} y={120 - (i % 2) * 10} s={0.8} />
        ))}
        <Label x={460} y={225} text="Too many eggs in one basket" bold color={RED} />
      </svg>
    ),
  },

  goals_horizon: {
    caption: "Money you need soon should stay safe. Money you won't touch for 30 years has time to ride out bad years in stocks.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A road with a near goal (a trip) and a far goal (retirement)">
        <path d="M20 200 H580" stroke="#8d8d8d" strokeWidth={34} strokeLinecap="round" />
        <path d="M40 200 H570" stroke="white" strokeWidth={4} strokeDasharray="20 16" />
        <Person x={50} y={180} s={1.2} color="#4a7fd4" />
        <Flag x={170} y={182} color="#f5a623" />
        <Tag x={170} y={70} w={200} text="TRIP NEXT SUMMER" />
        <Label x={170} y={98} text="Need it soon" bold />
        <Label x={170} y={250} text="Keep it safe: savings, GIC" color={BOND} bold />

        <Flag x={520} y={182} color={GREEN} />
        <Tag x={450} y={70} w={250} text="RETIREMENT IN 30 YEARS" />
        <Label x={450} y={98} text="Lots of time" bold />
        <Label x={470} y={250} text="Can invest in stocks" color={GREEN} bold />
      </svg>
    ),
  },

  dollar_cost_averaging: {
    caption: "$100 every month. When the price is low, your $100 buys more units. No need to guess the best moment.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Same $100 each month buys more units when the price is lower">
        {[
          { x: 110, m: "JAN", price: 20, units: 5 },
          { x: 300, m: "FEB", price: 10, units: 10 },
          { x: 490, m: "MAR", price: 25, units: 4 },
        ].map((c) => (
          <g key={c.m}>
            <Calendar x={c.x} y={50} month={c.m} />
            <Bill x={c.x} y={112} text="$100" />
            <Label x={c.x} y={150} text={`Price $${c.price}`} bold color={c.price === 10 ? GREEN : INK} />
            {Array.from({ length: c.units }, (_, i) => (
              <rect key={i} x={c.x - 58 + (i % 5) * 24} y={168 + Math.floor(i / 5) * 24} width={20} height={20} rx={4} fill="#f5c542" stroke={LINE} strokeWidth={2.5} />
            ))}
            <Label x={c.x} y={240} text={`= ${c.units} units`} bold size={15} />
          </g>
        ))}
        <Label x={300} y={262} text="Cheaper month, more units" color={GREEN} size={12} bold />
      </svg>
    ),
  },

  rebalancing: {
    caption: "Plan: 60% stocks, 40% bonds. After a great year stocks grew to 70%. Sell a little, buy bonds, and you're back to 60/40.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A 70/30 mix rebalanced back to 60/40">
        <Tag x={120} y={30} w={190} text="AFTER A GOOD YEAR" />
        <Pie cx={120} cy={130} r={70} parts={[[70, STOCK], [30, BOND]]} />
        <Label x={120} y={228} text="70% stocks / 30% bonds" bold />
        <Label x={120} y={248} text="more risk than you planned" color={RED} size={12} />

        <Arrow x1={220} y1={130} x2={370} y2={130} />
        <Label x={295} y={105} text="sell some stocks," size={12} />
        <Label x={295} y={160} text="buy some bonds" size={12} />

        <Tag x={480} y={30} w={150} text="BACK TO PLAN" />
        <Pie cx={480} cy={130} r={70} parts={[[60, STOCK], [40, BOND]]} />
        <Label x={480} y={228} text="60% stocks / 40% bonds" bold color={GREEN} />
      </svg>
    ),
  },

  hype_fomo: {
    caption: "Everyone is talking about a coin that went up 300%. You buy at the top, and a week later it drops 50%. That's FOMO.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A hyped price spikes, you buy at the top, then it crashes">
        <Megaphone x={75} y={110} s={1.3} />
        <Label x={80} y={180} text={"“It went up 300%!”"} bold />
        <Label x={80} y={200} text="everyone at school" color={GREY} size={12} />

        <rect x={180} y={20} width={400} height={225} rx={14} fill={PINK} stroke={LINE} strokeWidth={OUTLINE} />
        <ColorLine points="200,215 260,205 310,190 350,150 390,60 430,120 470,170 520,190 560,200" color={RED} />
        <circle cx={390} cy={60} r={9} fill="#f5c542" stroke={LINE} strokeWidth={OUTLINE} />
        <Tag x={275} y={110} w={150} text="YOU BUY HERE" />
        <Arrow x1={330} y1={92} x2={378} y2={66} />
        <Label x={510} y={110} text="-50% a week later" bold color={RED} />
      </svg>
    ),
  },

  registered_accounts: {
    caption: "Special boxes for your investments: a TFSA grows tax-free, an RRSP lowers your taxes now for retirement, an FHSA saves for a first home.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Three boxes labelled TFSA, RRSP and FHSA">
        {[
          { x: 100, name: "TFSA", color: "#f5c542", l1: "Growth is", l2: "tax-free" },
          { x: 300, name: "RRSP", color: "#9cc7f0", l1: "Lower tax now,", l2: "for retirement" },
          { x: 500, name: "FHSA", color: "#a6dba0", l1: "Save for your", l2: "first home" },
        ].map((b) => (
          <g key={b.name}>
            <MoneyBits x={b.x} />
            <AccountBox x={b.x} y={170} color={b.color} s={1.2} />
            <text x={b.x} y={137} textAnchor="middle" fontSize={17} fontWeight={800} fill={INK}>
              {b.name}
            </text>
            <Label x={b.x} y={205} text={b.l1} bold />
            <Label x={b.x} y={225} text={b.l2} bold />
          </g>
        ))}
      </svg>
    ),
  },

  investment_taxes: {
    caption: "Buy at $50, sell at $70: the $20 is a capital gain. In a regular account you may pay tax on it. In a TFSA you keep all $20.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A $20 gain is taxed in a regular account but kept whole in a TFSA">
        <Label x={90} y={40} text="Buy at $50" bold />
        <Bill x={90} y={75} text="$50" />
        <Arrow x1={135} y1={75} x2={200} y2={75} />
        <Label x={250} y={40} text="Sell at $70" bold />
        <Bill x={250} y={75} text="$70" />
        <Tag x={420} y={82} w={210} text="GAIN = $20" />

        <rect x={40} y={125} width={250} height={125} rx={14} fill="#f6f6f6" stroke={LINE} strokeWidth={OUTLINE} />
        <Label x={165} y={155} text="Regular account" bold />
        <g transform="translate(165 200)">
          <circle r={26} fill="#f5c542" stroke={LINE} strokeWidth={OUTLINE} />
          <circle cx={22} cy={-14} r={14} fill="#f6f6f6" />
          <text y={7} textAnchor="middle" fontSize={16} fontWeight={800} fill={INK}>
            $20
          </text>
        </g>
        <Label x={165} y={243} text="tax takes a bite" color={RED} size={12} bold />

        <rect x={310} y={125} width={250} height={125} rx={14} fill={GREEN_BG} stroke={LINE} strokeWidth={OUTLINE} />
        <Label x={435} y={155} text="Inside a TFSA" bold />
        <g transform="translate(435 200)">
          <circle r={26} fill="#f5c542" stroke={LINE} strokeWidth={OUTLINE} />
          <text y={7} textAnchor="middle" fontSize={16} fontWeight={800} fill={INK}>
            $20
          </text>
        </g>
        <Label x={435} y={243} text="you keep all of it" color={GREEN} size={12} bold />
      </svg>
    ),
  },

  market_index: {
    caption: "A class average tells you how the class did without checking every student. An index like the S&P 500 is the stock market's class average.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="Many companies averaged into one scoreboard number">
        {Array.from({ length: 10 }, (_, i) => {
          const x = 45 + (i % 5) * 52;
          const y = 85 + Math.floor(i / 5) * 90;
          const up = [true, true, false, true, true, false, true, true, true, false][i];
          return (
            <g key={i}>
              <Person x={x} y={y} s={0.95} color={["#4a7fd4", "#46b552", "#e8452c", "#f5a623", "#9b59b6"][i % 5]} />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={12} fontWeight={800} fill={up ? GREEN : RED}>
                {up ? "+" : "-"}
                {[2, 1, 1, 3, 2, 2, 1, 2, 1, 1][i]}%
              </text>
            </g>
          );
        })}
        <Label x={150} y={250} text="500 big US companies" bold />
        <Arrow x1={300} y1={135} x2={350} y2={135} />
        <rect x={365} y={65} width={210} height={130} rx={12} fill="#2f3446" stroke={LINE} strokeWidth={OUTLINE} />
        <text x={470} y={105} textAnchor="middle" fontSize={16} fontWeight={800} fill="white">
          S&amp;P 500
        </text>
        <text x={470} y={160} textAnchor="middle" fontSize={40} fontWeight={800} fill="#5bdc7a">
          +1%
        </text>
        <Label x={470} y={225} text="the market's scoreboard" bold />
      </svg>
    ),
  },

  research: {
    caption: "Before you buy, ask 5 questions, the same way you'd check a phone before buying it.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A checklist of five questions with a magnifying glass">
        <rect x={40} y={20} width={380} height={235} rx={14} fill="white" stroke={LINE} strokeWidth={OUTLINE} />
        {["What is it?", "How does it make money?", "What could go wrong?", "What does it cost (fees)?", "Does it fit my goal?"].map((q, i) => (
          <g key={q}>
            <rect x={62} y={40 + i * 42} width={24} height={24} rx={5} fill={i < 3 ? "#a6dba0" : "white"} stroke={LINE} strokeWidth={2.5} />
            {i < 3 && <path d={`M67 ${52 + i * 42} l5 5 l9 -10`} fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
            <text x={100} y={58 + i * 42} fontSize={16} fontWeight={700} fill={INK}>
              {q}
            </text>
          </g>
        ))}
        <Magnifier x={500} y={120} s={2} />
      </svg>
    ),
  },

  simulation: {
    caption: "Like a flight simulator for investing: “invest” pretend money with real past prices, including the scary drops, without risking a cent.",
    art: (
      <svg viewBox="0 0 600 270" role="img" aria-label="A computer screen showing a practice investment with pretend money">
        <Screen x={300} y={150} s={1.15} />
        <ColorLine points="200,190 240,170 270,182 300,140 330,160 370,110 400,100" color={GREEN} />
        <Tag x={300} y={95} w={210} text="PRETEND $10,000" />
        <Label x={300} y={264} text="Practice mode: no real money" bold color={BOND} />
        <g transform="translate(520 210)">
          <rect x={-40} y={-10} width={80} height={36} rx={10} fill="#e8452c" stroke={LINE} strokeWidth={OUTLINE} />
          <line x1={0} y1={-10} x2={0} y2={-46} stroke={LINE} strokeWidth={6} strokeLinecap="round" />
          <circle cy={-50} r={12} fill="#f5c542" stroke={LINE} strokeWidth={OUTLINE} />
        </g>
      </svg>
    ),
  },
};
