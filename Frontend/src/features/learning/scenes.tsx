// Drawn scenes for the "See it" slide, for topics where a picture explains it better
// than a graph. Flat, modern style: no outlines, soft shadows, a small set of colours,
// simple people without faces. Topics that need numbers use a graph instead (charts.tsx).

import type { ReactElement } from "react";
import { INK, INK2, BLUE, BLUE_D, BLUE_L, ORANGE, ORANGE_L, AQUA, AQUA_L, YELLOW, RED, RED_L } from "./sceneColors";
import { T, Shadow, Person, Coin, CoinStack, Card, Pill, Logo, Check, Arrow, Head, Svg, Egg, Basket } from "./sceneParts";

type Scene = { caption: string; art: ReactElement };

// ---------- the scenes ----------

export const SCENES: Record<string, Scene> = {
  stocks: {
    caption: "A company is split into many small pieces called shares. Buy one and you own a tiny piece: if the company does well, your piece is worth more.",
    art: (
      <Svg label="A coffee shop split into slices. One slice is yours, shown as a share card.">
        <Shadow x={230} y={262} w={320} />
        {/* sign */}
        <rect x={150} y={42} width={160} height={38} rx={10} fill={INK} />
        <T x={230} y={67} size={16} weight={700} color="#ffffff">
          COFFEE CO.
        </T>
        {/* walls */}
        <rect x={95} y={100} width={270} height={160} rx={6} fill="#f6e6d5" />
        {/* awning */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={85 + i * 32.2} y={88} width={32.2} height={30} fill={i % 2 ? "#ffffff" : RED} />
            <circle cx={85 + i * 32.2 + 16.1} cy={118} r={16.1} fill={i % 2 ? "#ffffff" : RED} />
          </g>
        ))}
        <rect x={82} y={84} width={296} height={8} rx={4} fill="#a5121e" />
        {/* window with a cup */}
        <rect x={115} y={152} width={128} height={80} rx={8} fill="#bfe0f5" />
        <path d="M128 228 L170 158 L190 158 L148 228 Z" fill="#ffffff" opacity={0.45} />
        <rect x={160} y={196} width={34} height={28} rx={6} fill="#ffffff" />
        <path d="M194 203 q12 0 12 8 q0 8 -12 8" stroke="#ffffff" strokeWidth={4} fill="none" />
        <path d="M170 186 q-5 -6 0 -12 M182 186 q-5 -6 0 -12" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* door */}
        <rect x={268} y={150} width={72} height={110} rx={6} fill="#7a5340" />
        <rect x={280} y={162} width={48} height={40} rx={4} fill="#bfe0f5" />
        <circle cx={328} cy={212} r={4} fill="#f5b524" />
        {/* slice lines + your slice */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={95 + (i + 1) * 30} x2={95 + (i + 1) * 30} y1={84} y2={260} stroke="#ffffff" strokeWidth={1.5} strokeDasharray="4 5" opacity={0.9} />
        ))}
        <rect x={95} y={84} width={30} height={176} fill={ORANGE} opacity={0.82} />
        <T x={110} y={285} size={13} weight={600} color={ORANGE}>
          your slice
        </T>
        {/* share card */}
        <Arrow d="M112 78 C150 0 400 0 430 80" />
        <Head x={430} y={80} color="#b5b5b5" dir="d" />
        <Card x={405} y={95} w={170} h={130} />
        <path d="M405 112 V109 A14 14 0 0 1 419 95 H561 A14 14 0 0 1 575 109 V112 Z" fill={ORANGE} />
        <T x={425} y={132} size={12} weight={600} color={INK2} anchor="start">
          SHARE
        </T>
        <T x={425} y={157} size={18} weight={700} anchor="start">
          Coffee Co.
        </T>
        <T x={425} y={181} size={13} color={INK2} anchor="start">
          1 of 1,000 pieces
        </T>
        <circle cx={545} cy={198} r={14} fill={ORANGE_L} />
        <circle cx={545} cy={198} r={7} fill={ORANGE} />
        <T x={490} y={255} size={14} weight={600}>
          What you own
        </T>
      </Svg>
    ),
  },

  etfs: {
    caption: "Buying one stock is like buying one item. An ETF is a whole basket of companies in one purchase, so if one does badly, the others soften the blow.",
    art: (
      <Svg label="One lonely company tile next to a basket full of many company tiles">
        {/* one stock */}
        <Shadow x={110} y={215} w={110} />
        <Logo x={75} y={140} size={70} color={ORANGE} kind={1} />
        <T x={110} y={250} size={15} weight={700}>
          1 stock
        </T>
        <T x={110} y={270} size={13} color={INK2}>
          = 1 company
        </T>
        <T x={215} y={180} size={22} weight={700} color="#c4c4c4">
          vs
        </T>
        {/* basket */}
        <Shadow x={410} y={265} w={260} />
        <path d="M300 150 C300 40 520 40 520 150" stroke={BLUE_D} strokeWidth={10} fill="none" strokeLinecap="round" />
        {[
          [318, 112, 42, ORANGE, 0], [356, 98, 46, AQUA, 1], [398, 92, 44, YELLOW, 2], [438, 100, 46, "#6250d6", 3], [480, 112, 40, RED, 0],
          [334, 128, 40, "#6250d6", 2], [370, 124, 44, RED, 3], [412, 120, 42, BLUE_D, 1], [452, 126, 42, AQUA, 0],
        ].map(([x, y, s, c, k], i) => (
          <Logo key={i} x={x as number} y={y as number} size={s as number} color={c as string} kind={k as number} />
        ))}
        <path d="M296 160 L524 160 L500 254 Q498 262 490 262 L330 262 Q322 262 320 254 Z" fill={BLUE} />
        {[186, 212, 238].map((y) => (
          <line key={y} x1={300 + (y - 160) * 0.25} x2={520 - (y - 160) * 0.25} y1={y} y2={y} stroke="#5b97e0" strokeWidth={3} />
        ))}
        {[350, 380, 410, 440, 470].map((x) => (
          <line key={x} x1={x} x2={410 + (x - 410) * 0.85} y1={162} y2={260} stroke="#5b97e0" strokeWidth={3} />
        ))}
        <rect x={286} y={148} width={248} height={18} rx={9} fill={BLUE_D} />
        <T x={410} y={292} size={15} weight={700}>
          1 ETF = hundreds of companies
        </T>
        {/* price tag */}
        <g transform="rotate(12 548 170)">
          <path d="M530 170 L545 155 L585 155 L585 185 L545 185 Z" fill="#ffffff" stroke="#e3e3e3" />
          <circle cx={542} cy={170} r={3} fill="#c4c4c4" />
          <T x={566} y={175} size={13} weight={700}>
            $100
          </T>
        </g>
      </Svg>
    ),
  },

  reits: {
    caption: "A REIT owns buildings like apartments, malls and offices. Tenants pay rent, and the REIT passes part of it to everyone who owns a share.",
    art: (
      <Svg label="Buildings collect rent, the rent goes to the REIT, and the REIT pays its owners">
        {/* buildings */}
        <Shadow x={135} y={256} w={220} />
        <rect x={45} y={70} width={100} height={185} rx={6} fill="#6f86a6" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={58 + (i % 3) * 28} y={88 + Math.floor(i / 3) * 38} width={18} height={24} rx={3} fill={i % 4 === 1 ? "#ffe8a3" : "#c9d6e8"} />
        ))}
        <rect x={140} y={140} width={95} height={115} rx={6} fill="#9fb1c9" />
        <rect x={140} y={140} width={95} height={14} rx={4} fill={AQUA} />
        {[0, 1].map((i) => (
          <rect key={i} x={152 + i * 42} y={170} width={30} height={34} rx={4} fill="#e4ecf5" />
        ))}
        <rect x={172} y={215} width={30} height={40} rx={3} fill="#5d7392" />
        <T x={135} y={285} size={14} weight={600}>
          Buildings
        </T>
        {/* rent flow */}
        <Arrow d="M245 170 L300 170" />
        <Head x={302} y={170} color="#b5b5b5" dir="r" />
        <Coin x={262} y={148} r={10} />
        <Coin x={282} y={140} r={10} />
        <T x={272} y={200} size={12} color={INK2}>
          rent
        </T>
        {/* REIT */}
        <Card x={310} y={120} w={100} h={100} />
        <path d="M335 175 L360 152 L385 175 Z" fill={BLUE} />
        <rect x={340} y={175} width={40} height={26} fill={BLUE} />
        <rect x={355} y={185} width={10} height={16} fill="#ffffff" />
        <T x={360} y={252} size={14} weight={600}>
          The REIT
        </T>
        <Arrow d="M420 170 L445 170" />
        <Head x={447} y={170} color="#b5b5b5" dir="r" />
        {/* owners */}
        <Person x={470} y={235} s={0.85} shirt={ORANGE} k={0} />
        <Person x={512} y={240} s={0.95} shirt={BLUE} k={2} />
        <Person x={552} y={235} s={0.8} shirt={AQUA} k={1} />
        <Coin x={470} y={140} r={9} />
        <Coin x={512} y={128} r={9} />
        <Coin x={552} y={142} r={9} />
        <T x={510} y={275} size={14} weight={600}>
          You and other owners
        </T>
      </Svg>
    ),
  },

  mutual_funds: {
    caption: "Many people put money into one big pot. A professional manager invests the whole pot, and each person owns their share of it. The manager charges a yearly fee.",
    art: (
      <Svg label="Four people drop coins into one jar, and a manager invests the jar">
        {[
          [60, ORANGE, 0], [120, AQUA, 1], [180, BLUE, 2], [240, "#6250d6", 3],
        ].map(([x, c, k]) => (
          <g key={x as number}>
            <Person x={x as number} y={270} s={0.8} shirt={c as string} k={k as number} />
            <Coin x={x as number} y={150} r={10} />
            
          </g>
        ))}
        <Arrow d="M262 200 L280 200" />
        <Head x={282} y={200} color="#b5b5b5" dir="r" />
        <T x={150} y={110} size={14} weight={600}>
          Everyone chips in
        </T>
        {/* jar */}
        <Shadow x={340} y={262} w={150} />
        <rect x={305} y={82} width={70} height={18} rx={6} fill={BLUE_D} />
        <path d="M290 110 Q290 100 300 100 L380 100 Q390 100 390 110 L395 245 Q395 260 380 260 L300 260 Q285 260 285 245 Z" fill={BLUE_L} />
        <CoinStack x={318} y={245} n={6} r={18} />
        <CoinStack x={358} y={248} n={9} r={18} />
        <path d="M300 120 L300 230" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        <rect x={300} y={130} width={80} height={30} rx={8} fill="#ffffff" />
        <T x={340} y={151} size={14} weight={700} color={BLUE_D}>
          FUND
        </T>
        {/* manager */}
        <Person x={490} y={270} s={1.05} shirt={INK} k={3} tie={RED} />
        <g transform="rotate(-6 540 175)">
          <rect x={515} y={140} width={62} height={76} rx={6} fill="#ffffff" stroke="#e3e3e3" />
          <path d="M524 200 L538 186 L550 192 L566 162" stroke={AQUA} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <T x={500} y={60} size={14} weight={600}>
          A pro invests it
        </T>
        <T x={500} y={80} size={12} color={INK2}>
          (for a yearly fee)
        </T>
      </Svg>
    ),
  },

  investor_profile: {
    caption: "Imagine your $10,000 drops to $8,000 in a month. Your honest reaction hints at your profile: conservative, balanced or growth.",
    art: (
      <Svg label="Three gauges: sell means conservative, wait means balanced, buy more means growth">
        <T x={300} y={32} size={16} weight={700}>
          Your $10,000 drops to $8,000. You...
        </T>
        {[
          { x: 105, word: "Sell", who: "Conservative", c: BLUE, a: -55 },
          { x: 300, word: "Wait", who: "Balanced", c: YELLOW, a: 0 },
          { x: 495, word: "Buy more", who: "Growth", c: AQUA, a: 55 },
        ].map((g) => (
          <g key={g.word}>
            <Card x={g.x - 88} y={55} w={176} h={220} />
            <g transform={`translate(${g.x} 160)`}>
              <path d="M-60 0 A60 60 0 0 1 -30 -52" stroke={BLUE} strokeWidth={14} fill="none" opacity={g.c === BLUE ? 1 : 0.25} />
              <path d="M-26 -54.5 A60 60 0 0 1 26 -54.5" stroke={YELLOW} strokeWidth={14} fill="none" opacity={g.c === YELLOW ? 1 : 0.25} />
              <path d="M30 -52 A60 60 0 0 1 60 0" stroke={AQUA} strokeWidth={14} fill="none" opacity={g.c === AQUA ? 1 : 0.25} />
              <g transform={`rotate(${g.a})`}>
                <path d="M-4 0 L0 -48 L4 0 Z" fill={INK} />
              </g>
              <circle r={8} fill={INK} />
            </g>
            <T x={g.x} y={208} size={18} weight={700}>
              {g.word}
            </T>
            <Pill x={g.x} y={245} text={g.who} color={g.c === YELLOW ? "#9a6a00" : g.c === AQUA ? "#0f7a52" : BLUE_D} light={g.c === YELLOW ? "#fff3d1" : g.c === AQUA ? AQUA_L : BLUE_L} />
          </g>
        ))}
      </Svg>
    ),
  },

  diversification: {
    caption: "With everything in one basket, one slip breaks a lot. Spread across many baskets, one drop only breaks a little.",
    art: (
      <Svg label="One basket tipping with broken eggs, next to three baskets with safe eggs">
        {/* left: one basket tipping */}
        <Shadow x={150} y={242} w={200} />
        <g transform="rotate(-14 150 200)">
          {[[105, 140], [135, 132], [165, 132], [195, 140], [120, 150], [150, 146], [180, 150]].map(([x, y], i) => (
            <Egg key={i} x={x} y={y} />
          ))}
          <Basket x={150} y={200} w={150} />
        </g>
        <Egg x={262} y={232} broken />
        <Egg x={238} y={240} broken />
        <Pill x={150} y={275} text="All in one basket" color={RED} light={RED_L} />
        <line x1={300} x2={300} y1={40} y2={260} stroke="#ececec" strokeWidth={2} />
        {/* right: three baskets */}
        {[368, 450, 532].map((x, i) => (
          <g key={x}>
            <Shadow x={x} y={232} w={70} />
            {i === 1 ? (
              <>
                <Egg x={x - 13} y={180} />
                <Egg x={x + 16} y={240} broken />
              </>
            ) : (
              <>
                <Egg x={x - 13} y={180} />
                <Egg x={x + 13} y={180} />
              </>
            )}
            <Basket x={x} y={205} w={64} />
          </g>
        ))}
        <Pill x={450} y={275} text="Spread out" color="#0f7a52" light={AQUA_L} />
      </Svg>
    ),
  },

  goals_horizon: {
    caption: "The longer until you need the money, the more ups and downs you can ride out. Money for next summer stays safe; money for retirement can grow in stocks.",
    art: (
      <Svg label="A road with three stops: a trip in 1 year, a car in 4 years, retirement in 30 years" h={330}>
        <g transform="translate(0 24)">
        <path d="M20 230 C150 230 160 190 300 190 S460 150 590 150" stroke="#e3e3e3" strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d="M20 230 C150 230 160 190 300 190 S460 150 590 150" stroke="#ffffff" strokeWidth={3} strokeDasharray="14 12" fill="none" />
        {[
          { x: 110, y: 228, c: AQUA, l: AQUA_L, top: "1 year", what: "Trip", note: "Keep it safe", icon: "bag" },
          { x: 300, y: 190, c: YELLOW, l: "#fff3d1", top: "4 years", what: "Car", note: "Mostly safe", icon: "car" },
          { x: 500, y: 158, c: BLUE, l: BLUE_L, top: "30 years", what: "Retirement", note: "Can be in stocks", icon: "house" },
        ].map((p) => (
          <g key={p.top}>
            <line x1={p.x} x2={p.x} y1={p.y} y2={p.y - 70} stroke={p.c} strokeWidth={3} />
            <circle cx={p.x} cy={p.y} r={7} fill={p.c} />
            <circle cx={p.x} cy={p.y - 100} r={36} fill="#ffffff" stroke={p.c} strokeWidth={4} />
            <g transform={`translate(${p.x} ${p.y - 100})`}>
              {p.icon === "bag" && (
                <>
                  <rect x={-17} y={-10} width={34} height={26} rx={5} fill={p.c} />
                  <path d="M-7 -10 V-16 H7 V-10" stroke={p.c} strokeWidth={3} fill="none" />
                  <line x1={-17} x2={17} y1={0} y2={0} stroke="#ffffff" strokeWidth={2} />
                </>
              )}
              {p.icon === "car" && (
                <>
                  <path d="M-20 6 V-2 Q-20 -6 -15 -7 L-10 -16 H10 L16 -7 Q20 -6 20 -2 V6 Z" fill={p.c} />
                  <rect x={-8} y={-13} width={16} height={7} rx={2} fill="#ffffff" />
                  <circle cx={-11} cy={7} r={5} fill={INK} />
                  <circle cx={11} cy={7} r={5} fill={INK} />
                </>
              )}
              {p.icon === "house" && (
                <>
                  <path d="M-20 -2 L0 -20 L20 -2 Z" fill={p.c} />
                  <rect x={-15} y={-3} width={30} height={20} fill={p.c} />
                  <rect x={-4} y={5} width={8} height={12} fill="#ffffff" />
                </>
              )}
            </g>
            <T x={p.x} y={p.y - 150} size={14} weight={700}>
              {`${p.what} in ${p.top}`}
            </T>
            <Pill x={p.x} y={p.y + 50} text={p.note} color={p.c === YELLOW ? "#9a6a00" : p.c === AQUA ? "#0f7a52" : BLUE_D} light={p.l} />
          </g>
        ))}
        </g>
      </Svg>
    ),
  },

  hype_fomo: {
    caption: "By the time everyone online is shouting about it, the price has often already shot up. Pause and check before you buy.",
    art: (
      <Svg label="A phone full of hype messages and a price that spikes then crashes, next to a person who pauses">
        <Shadow x={160} y={286} w={170} />
        <rect x={85} y={22} width={150} height={262} rx={24} fill={INK} />
        <rect x={95} y={36} width={130} height={234} rx={16} fill="#f7f7f7" />
        <rect x={140} y={42} width={40} height={6} rx={3} fill={INK} />
        <path d="M105 240 L130 232 L150 222 L170 160 L185 92 L198 150 L215 214" stroke={ORANGE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={185} cy={92} r={5} fill={ORANGE} />
        <T x={177} y={96} size={11} weight={700} color={INK2} anchor="end">
          buy here?
        </T>
        {[
          { y: 60, text: "This coin will 10x!!" },
          { y: 112, text: "Everyone is buying" },
          { y: 164, text: "Last chance, buy now" },
        ].map((b, i) => (
          <g key={b.text}>
            <Card x={200 + i * 14} y={b.y} w={180} h={40} />
            <circle cx={220 + i * 14} cy={b.y + 20} r={8} fill={i === 1 ? AQUA : i === 2 ? "#6250d6" : BLUE} />
            <T x={236 + i * 14} y={b.y + 25} size={13} weight={600} anchor="start">
              {b.text}
            </T>
            <circle cx={378 + i * 14} cy={b.y + 2} r={6} fill={RED} />
          </g>
        ))}
        {/* person pausing */}
        <Person x={510} y={280} s={1.2} shirt={BLUE} k={1} />
        <Card x={440} y={50} w={150} h={58} />
        <path d="M500 108 L510 122 L520 108 Z" fill="#ffffff" />
        <T x={515} y={75} size={13} weight={700}>
          Wait. Do I
        </T>
        <T x={515} y={94} size={13} weight={700}>
          understand it?
        </T>
      </Svg>
    ),
  },

  registered_accounts: {
    caption: "Three special accounts with tax breaks, each with a yearly limit (contribution room). Rules change, so check Canada.ca.",
    art: (
      <Svg label="Three jars: TFSA for any goal, RRSP for retirement, FHSA for a first home">
        {[
          { x: 105, name: "TFSA", c: AQUA, l: AQUA_L, goal: "Any goal", perk: "Growth is tax-free", coins: [5, 7] },
          { x: 300, name: "RRSP", c: BLUE, l: BLUE_L, goal: "Retirement", perk: "Tax break now", coins: [8, 6] },
          { x: 495, name: "FHSA", c: ORANGE, l: ORANGE_L, goal: "First home", perk: "Tax break + tax-free", coins: [4, 6] },
        ].map((j) => (
          <g key={j.name}>
            <Shadow x={j.x} y={238} w={140} />
            <rect x={j.x - 46} y={58} width={92} height={20} rx={7} fill={j.c} />
            <path d={`M${j.x - 60} 92 Q${j.x - 60} 80 ${j.x - 48} 80 L${j.x + 48} 80 Q${j.x + 60} 80 ${j.x + 60} 92 L${j.x + 62} 222 Q${j.x + 62} 236 ${j.x + 48} 236 L${j.x - 48} 236 Q${j.x - 62} 236 ${j.x - 62} 222 Z`} fill={j.l} />
            <CoinStack x={j.x - 22} y={222} n={j.coins[0]} r={18} />
            <CoinStack x={j.x + 22} y={224} n={j.coins[1]} r={18} />
            <path d={`M${j.x - 48} 100 L${j.x - 48} 200`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            <rect x={j.x - 40} y={102} width={80} height={30} rx={8} fill="#ffffff" />
            <T x={j.x} y={123} size={15} weight={700} color={j.c === AQUA ? "#0f7a52" : j.c === BLUE ? BLUE_D : "#b84a1c"}>
              {j.name}
            </T>
            <T x={j.x} y={264} size={14} weight={700}>
              {j.goal}
            </T>
            <T x={j.x} y={284} size={13} color={INK2}>
              {j.perk}
            </T>
          </g>
        ))}
      </Svg>
    ),
  },

  investment_taxes: {
    caption: "Example: a $20 gain in a regular account. About $3 can go to tax, so you keep about $17. In a TFSA you keep all $20.",
    art: (
      <Svg label="In a regular account a few coins go to the government; in a TFSA you keep all the coins">
        {/* regular */}
        <Card x={20} y={20} w={270} h={260} />
        <T x={155} y={52} size={15} weight={700}>
          Regular account
        </T>
        <Shadow x={95} y={206} w={80} />
        <CoinStack x={95} y={200} n={10} r={22} />
        <T x={95} y={236} size={13} weight={600}>
          $20 gain
        </T>
        <Arrow d="M125 120 Q170 90 205 130" />
        <Head x={207} y={133} color="#b5b5b5" dir="d" />
        <Coin x={160} y={92} r={9} />
        {/* government building */}
        <path d="M180 160 L220 140 L260 160 Z" fill="#9a9a9a" />
        {[188, 205, 222, 239].map((x) => (
          <rect key={x} x={x} y={162} width={9} height={36} fill="#b9b9b9" />
        ))}
        <rect x={180} y={198} width={80} height={8} rx={2} fill="#9a9a9a" />
        <T x={220} y={236} size={13} weight={600}>
          tax ~$3
        </T>
        <Pill x={155} y={262} text="You keep ~$17" color={INK} light="#f1f1f1" />
        {/* TFSA */}
        <Card x={310} y={20} w={270} h={260} />
        <T x={445} y={52} size={15} weight={700}>
          TFSA
        </T>
        <Shadow x={445} y={206} w={80} />
        <CoinStack x={445} y={200} n={11} r={22} />
        <path d="M505 100 L530 90 L555 100 V120 Q555 140 530 150 Q505 140 505 120 Z" fill={AQUA} />
        <path d="M519 120 l7 7 l13 -15" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <T x={445} y={236} size={13} weight={600}>
          $20 gain
        </T>
        <Pill x={445} y={262} text="You keep all $20" color="#0f7a52" light={AQUA_L} />
      </Svg>
    ),
  },

  bull_bear: {
    caption: "A bull strikes UP with its horns: prices keep rising. A bear swipes DOWN with its paws: prices fall 20% or more.",
    art: (
      <Svg label="A bull with an up arrow and a bear with a down arrow">
        {/* bull */}
        <circle cx={150} cy={135} r={100} fill={AQUA_L} />
                <g>
          <path d="M118 108 C96 104 78 92 70 66 C88 80 106 86 128 90 Z" fill="#f3e3c3" />
          <path d="M182 108 C204 104 222 92 230 66 C212 80 194 86 172 90 Z" fill="#f3e3c3" />
          <ellipse cx={104} cy={124} rx={18} ry={9} transform="rotate(20 104 124)" fill="#7a4b2a" />
          <ellipse cx={196} cy={124} rx={18} ry={9} transform="rotate(-20 196 124)" fill="#7a4b2a" />
          <path d="M118 96 Q150 84 182 96 Q194 150 178 192 Q150 206 122 192 Q106 150 118 96 Z" fill="#8d5a3b" />
          <path d="M140 92 Q150 100 160 92 Q156 110 150 112 Q144 110 140 92 Z" fill="#7a4b2a" />
          <ellipse cx={150} cy={180} rx={30} ry={20} fill="#e9b48a" />
          <ellipse cx={139} cy={180} rx={4} ry={6} fill="#7a4b2a" />
          <ellipse cx={161} cy={180} rx={4} ry={6} fill="#7a4b2a" />
          <circle cx={134} cy={138} r={5} fill={INK} />
          <circle cx={166} cy={138} r={5} fill={INK} />
        </g>
        <path d="M222 70 L222 30 M206 46 L222 30 L238 46" stroke={AQUA} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <T x={150} y={268} size={16} weight={700}>
          Bull market
        </T>
        <T x={150} y={288} size={13} color={INK2}>
          prices keep going up
        </T>
        {/* bear */}
        <circle cx={450} cy={135} r={100} fill={RED_L} />
                <g>
          <circle cx={410} cy={95} r={22} fill="#6b4a3a" />
          <circle cx={490} cy={95} r={22} fill="#6b4a3a" />
          <circle cx={410} cy={95} r={11} fill="#c99a74" />
          <circle cx={490} cy={95} r={11} fill="#c99a74" />
          <circle cx={450} cy={145} r={58} fill="#6b4a3a" />
          <ellipse cx={450} cy={168} rx={28} ry={21} fill="#d9b08a" />
          <ellipse cx={450} cy={158} rx={10} ry={7} fill={INK} />
          <path d="M450 165 V174 M442 178 Q450 183 458 178" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <circle cx={430} cy={133} r={5} fill={INK} />
          <circle cx={470} cy={133} r={5} fill={INK} />
        </g>
        <path d="M528 30 L528 70 M512 54 L528 70 L544 54" stroke={RED} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <T x={450} y={268} size={16} weight={700}>
          Bear market
        </T>
        <T x={450} y={288} size={13} color={INK2}>
          prices fall 20% or more
        </T>
      </Svg>
    ),
  },

  research: {
    caption: "Before buying, answer a few simple questions. If you can't answer one simply, learn more first.",
    art: (
      <Svg label="A clipboard checklist and a magnifying glass over a company">
        <Shadow x={220} y={286} w={220} />
        <rect x={110} y={30} width={220} height={252} rx={16} fill={BLUE} />
        <rect x={126} y={56} width={188} height={212} rx={8} fill="#ffffff" />
        <rect x={180} y={20} width={80} height={26} rx={8} fill={INK} />
        {["What does it do?", "What are the fees?", "How risky is it?", "Does it fit my goal?"].map((q, i) => (
          <g key={q}>
            <Check x={142} y={78 + i * 46} on={i < 3} />
            <T x={170} y={92 + i * 46} size={14} weight={500} anchor="start">
              {q}
            </T>
          </g>
        ))}
        {/* magnifying glass over a company tile */}
        <Logo x={418} y={110} size={64} color={ORANGE} kind={2} />
        <circle cx={450} cy={142} r={62} fill={BLUE_L} opacity={0.45} />
        <circle cx={450} cy={142} r={62} fill="none" stroke={INK} strokeWidth={10} />
        <path d="M418 108 A44 44 0 0 1 470 100" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
        <path d="M494 186 L548 240" stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <T x={450} y={280} size={14} weight={600}>
          Look closely first
        </T>
      </Svg>
    ),
  },

  simulation: {
    caption: "Practice with pretend money on real prices, including the scary drops, without risking a cent.",
    art: (
      <Svg label="A laptop showing a practice account with $10,000 of pretend money">
        <Shadow x={300} y={278} w={420} />
        <rect x={120} y={28} width={360} height={220} rx={14} fill={INK} />
        <rect x={132} y={40} width={336} height={196} rx={6} fill="#ffffff" />
        <path d="M90 250 L510 250 L494 272 Q490 276 482 276 L118 276 Q110 276 106 272 Z" fill="#c4c4c4" />
        <rect x={270} y={250} width={60} height={6} rx={3} fill="#9a9a9a" />
        <T x={152} y={66} size={12} weight={600} color={INK2} anchor="start">
          PRACTICE ACCOUNT
        </T>
        <T x={152} y={98} size={28} weight={700} anchor="start">
          $10,000
        </T>
        <T x={152} y={118} size={12} color={INK2} anchor="start">
          pretend money
        </T>
        <path d="M152 200 L190 186 L215 194 L245 162 L268 176 L300 142 L325 168 L350 150" stroke={BLUE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M152 200 L190 186 L215 194 L245 162 L268 176 L300 142 L325 168 L350 150 L350 222 L152 222 Z" fill={BLUE} opacity={0.1} />
        <rect x={375} y={150} width={76} height={30} rx={15} fill={AQUA} />
        <T x={413} y={170} size={13} weight={700} color="#ffffff">
          Buy
        </T>
        <rect x={375} y={190} width={76} height={30} rx={15} fill="#eeeeee" />
        <T x={413} y={210} size={13} weight={700}>
          Sell
        </T>
        <g transform="rotate(12 470 52)">
          <circle cx={470} cy={52} r={40} fill={ORANGE} />
          <T x={470} y={48} size={12} weight={700} color="#ffffff">
            NO REAL
          </T>
          <T x={470} y={64} size={12} weight={700} color="#ffffff">
            MONEY
          </T>
        </g>
      </Svg>
    ),
  },
};

