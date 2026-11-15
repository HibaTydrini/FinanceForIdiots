// Reusable drawing pieces for the explainer pictures (illustrations.tsx).
// Style: flat bright colours with a bold dark outline, like a kids' book.
// Every piece is drawn around its centre (x, y) and can be scaled with s.

import { INK, OUTLINE, YELLOW, LINE } from "./drawingColors";

type At = { x: number; y: number; s?: number; rotate?: number };

function place({ x, y, s = 1, rotate = 0 }: At) {
  return `translate(${x} ${y}) rotate(${rotate}) scale(${s})`;
}

const line = { stroke: LINE, strokeWidth: OUTLINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function Arrow({ x1, y1, x2, y2, color = INK }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 11;
  const p1 = `${x2 - h * Math.cos(a - 0.5)},${y2 - h * Math.sin(a - 0.5)}`;
  const p2 = `${x2 - h * Math.cos(a + 0.5)},${y2 - h * Math.sin(a + 0.5)}`;
  return (
    <g stroke={color} strokeWidth={OUTLINE} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${p1} ${x2},${y2} ${p2}`} />
    </g>
  );
}

// Big bold label with a yellow highlight behind it, like a poster.
export function Tag({ x, y, text, w }: { x: number; y: number; text: string; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 19} width={w} height={28} rx={4} fill={YELLOW} />
      <text x={x} y={y} textAnchor="middle" fontSize={16} fontWeight={800} letterSpacing={1} fill={INK}>
        {text}
      </text>
    </g>
  );
}

export function Tomato(p: At) {
  return (
    <g transform={place(p)}>
      <circle r={22} fill="#e8452c" {...line} />
      <path d="M-11 -14 Q-6 -8 -12 -4" fill="none" stroke="#ff8a70" strokeWidth={4} strokeLinecap="round" />
      <path d="M0 -24 l-12 2 l8 3 l-6 7 l10 -6 l10 6 l-6 -7 l8 -3 z" fill="#3fae49" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Carrot(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-4 -24 q-8 -14 -2 -18 q4 6 4 14 q2 -10 8 -12 q2 8 -4 16 z" fill="#3fae49" {...line} strokeWidth={2.5} />
      <path d="M-11 -20 Q0 -26 11 -20 L2 30 Q0 33 -2 30 Z" fill="#f28a2e" {...line} />
      <path d="M-6 -6 h5 M2 6 h5 M-3 17 h4" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

export function Pepper(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-21 -8 Q-24 24 -7 25 Q0 21 7 25 Q24 24 21 -8 Q13 -19 0 -13 Q-13 -19 -21 -8 Z" fill="#3fae49" {...line} />
      <path d="M-12 -4 Q-14 10 -9 18" fill="none" stroke="#7ad37f" strokeWidth={4} strokeLinecap="round" />
      <path d="M0 -13 q0 -8 6 -12" fill="none" {...line} stroke="#2b7a33" strokeWidth={4} />
    </g>
  );
}

export function Banana(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-30 -6 Q0 28 32 -10 Q34 -14 30 -14 Q4 12 -26 -12 Q-31 -12 -30 -6 Z" fill="#f7d02c" {...line} />
      <path d="M30 -14 l4 -6" {...line} />
    </g>
  );
}

export function Strawberry(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-16 -10 Q-18 14 0 24 Q18 14 16 -10 Q0 -16 -16 -10 Z" fill="#e23b4b" {...line} />
      {[
        [-7, -2],
        [5, -3],
        [-1, 7],
        [8, 8],
        [-8, 10],
        [0, 16],
      ].map(([a, b]) => (
        <ellipse key={`${a},${b}`} cx={a} cy={b} rx={1.6} ry={2.4} fill="#ffe27a" />
      ))}
      <path d="M-12 -12 l6 -6 l6 4 l6 -4 l6 6 z" fill="#3fae49" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Corn(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-12 -30 Q0 -40 12 -30 L10 22 Q0 28 -10 22 Z" fill="#f5c542" {...line} />
      {[-18, -8, 2, 12].map((yy) => (
        <path key={yy} d={`M-10 ${yy} H10`} stroke="#c99a1c" strokeWidth={2} />
      ))}
      <path d="M0 -32 V22" stroke="#c99a1c" strokeWidth={2} />
      <path d="M-10 22 Q-22 0 -18 -18 Q-6 0 -2 26 Z" fill="#3fae49" {...line} strokeWidth={2.5} />
      <path d="M10 22 Q22 0 18 -18 Q6 0 2 26 Z" fill="#3fae49" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Leaves(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M0 10 Q-26 -6 -14 -30 Q6 -18 0 10 Z" fill="#2f9a3f" {...line} strokeWidth={2.5} />
      <path d="M0 10 Q26 -4 18 -28 Q-2 -16 0 10 Z" fill="#46b552" {...line} strokeWidth={2.5} />
    </g>
  );
}

// Handle of a round wicker basket. Draw it BEFORE the food so the food sits in front.
export function BasketHandle({ x, y, w = 200 }: { x: number; y: number; w?: number }) {
  const d = `M${x + w * 0.14} ${y + 4} C${x + w * 0.14} ${y - w * 0.62} ${x + w * 0.86} ${y - w * 0.62} ${x + w * 0.86} ${y + 4}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={LINE} strokeWidth={w * 0.07 + 6} />
      <path d={d} stroke="#ecc88d" strokeWidth={w * 0.07} />
      <path d={d} stroke="#d4a868" strokeWidth={2} strokeDasharray="5 9" />
    </g>
  );
}

// A round wicker basket. (x, y) is the left end of its rim, w its width.
export function Basket({ x, y, w = 200 }: { x: number; y: number; w?: number; color?: string }) {
  const h = w * 0.48;
  const rows = 4;
  return (
    <g>
      <path
        d={`M${x + 2} ${y + 6} C${x + 4} ${y + h * 0.9} ${x + w * 0.16} ${y + h} ${x + w * 0.3} ${y + h} H${x + w * 0.7} C${x + w * 0.84} ${y + h} ${x + w - 4} ${y + h * 0.9} ${x + w - 2} ${y + 6} Z`}
        fill="#ecc88d"
        {...line}
      />
      {Array.from({ length: rows }, (_, r) => {
        const yy = y + 18 + (r * (h - 26)) / rows;
        const inset = (r / rows) ** 2 * w * 0.08;
        return (
          <path
            key={r}
            d={`M${x + 10 + inset} ${yy} H${x + w - 10 - inset}`}
            stroke="#c9995a"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={r % 2 ? "10 7" : "7 10"}
          />
        );
      })}
      <rect x={x - 5} y={y - 4} width={w + 10} height={16} rx={8} fill="#f4dba8" {...line} />
      <path d={`M${x + 4} ${y + 4} H${x + w - 4}`} stroke="#d4a868" strokeWidth={2} strokeDasharray="4 7" strokeLinecap="round" />
    </g>
  );
}

export function Egg({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={place({ x, y, s })}>
      <ellipse rx={12} ry={15} fill="#fff6e0" {...line} />
      <path d="M-5 -8 Q-7 -2 -5 3" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export function BrokenEgg({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={place({ x, y, s })}>
      <path d="M-22 4 Q-26 -8 -12 -9 Q-6 -16 4 -11 Q18 -14 20 -3 Q28 6 14 10 Q0 14 -12 10 Q-24 12 -22 4 Z" fill="white" {...line} strokeWidth={2.5} />
      <circle cx={0} cy={0} r={8} fill="#f7b928" {...line} strokeWidth={2.5} />
      <path d="M-30 -10 l6 -10 l4 8 l5 -8 l2 10" fill="#fff6e0" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Coins({ x, y, count, color = "#f5c542" }: { x: number; y: number; count: number; color?: string }) {
  // a stack of coins standing on (x, y), bottom coin first
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`translate(${x} ${y - i * 9})`}>
          <path d="M-18 0 v-5 a18 6 0 0 1 36 0 v5 a18 6 0 0 1 -36 0 z" fill={color} {...line} strokeWidth={2.5} />
          <ellipse cx={0} cy={-5} rx={18} ry={6} fill={color} {...line} strokeWidth={2.5} />
        </g>
      ))}
    </g>
  );
}

// Small grey or dark text, centred.
export function Label({ x, y, text, size = 13, color = INK, bold = false }: { x: number; y: number; text: string; size?: number; color?: string; bold?: boolean }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight={bold ? 800 : 400} fill={color}>
      {text}
    </text>
  );
}

export function Person({ color = "#4a7fd4", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <path d="M-16 4 Q-16 -16 0 -16 Q16 -16 16 4 Z" fill={color} {...line} />
      <circle cy={-28} r={11} fill="#f2c9a0" {...line} />
      <circle cx={-4} cy={-29} r={1.6} fill={INK} />
      <circle cx={4} cy={-29} r={1.6} fill={INK} />
    </g>
  );
}

export function Coin(p: At) {
  return (
    <g transform={place(p)}>
      <circle r={13} fill="#f5c542" {...line} />
      <text y={5} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        $
      </text>
    </g>
  );
}

export function Bill({ text = "$", ...p }: At & { text?: string }) {
  return (
    <g transform={place(p)}>
      <rect x={-32} y={-16} width={64} height={32} rx={4} fill="#9fd49a" {...line} />
      <rect x={-25} y={-10} width={50} height={20} rx={3} fill="none" stroke="#5aa463" strokeWidth={2} />
      <text y={5} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
        {text}
      </text>
    </g>
  );
}

// A money plant: a pot with a stem, leaves and coins growing on it.
export function MoneyPlant(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M0 10 C-2 -20 4 -40 0 -70" fill="none" stroke="#2f7d3a" strokeWidth={5} strokeLinecap="round" />
      <path d="M0 -20 Q-34 -26 -38 -52 Q-8 -46 0 -20 Z" fill="#46b552" {...line} strokeWidth={2.5} />
      <path d="M1 -38 Q34 -42 38 -68 Q8 -64 1 -38 Z" fill="#2f9a3f" {...line} strokeWidth={2.5} />
      <path d="M0 -62 Q-22 -74 -18 -94 Q2 -84 0 -62 Z" fill="#46b552" {...line} strokeWidth={2.5} />
      <Coin x={-26} y={-58} s={0.75} />
      <Coin x={28} y={-82} s={0.75} />
      <Coin x={8} y={-100} s={0.75} />
      <path d="M-30 6 H30 L24 46 H-24 Z" fill="#d9774a" {...line} />
      <rect x={-34} y={0} width={68} height={12} rx={3} fill="#e98a5c" {...line} />
    </g>
  );
}

export function Mattress(p: At) {
  return (
    <g transform={place(p)}>
      <rect x={-80} y={-22} width={160} height={44} rx={14} fill="#9cc7f0" {...line} />
      {[-50, -17, 17, 50].map((dx) => (
        <circle key={dx} cx={dx} cy={0} r={2.5} fill="#5d8fc0" />
      ))}
    </g>
  );
}

// Columns building (a bank or the government). (x, y) is the bottom centre.
export function Columns({ color = "#f3efe6", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <path d="M-50 -70 L0 -98 L50 -70 Z" fill={color} {...line} />
      <rect x={-50} y={-70} width={100} height={10} fill={color} {...line} />
      {[-36, -12, 12, 36].map((cx) => (
        <rect key={cx} x={cx - 6} y={-60} width={12} height={50} fill={color} {...line} strokeWidth={2.5} />
      ))}
      <rect x={-56} y={-10} width={112} height={10} fill={color} {...line} />
    </g>
  );
}

// An apartment/office block. (x, y) is the bottom centre.
export function Building({ w = 70, h = 110, color = "#f0b860", ...p }: At & { w?: number; h?: number; color?: string }) {
  const cols = Math.max(2, Math.round(w / 26));
  const rows = Math.max(2, Math.round((h - 30) / 26));
  return (
    <g transform={place(p)}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={3} fill={color} {...line} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const gx = w / cols;
        return <rect key={i} x={-w / 2 + c * gx + gx * 0.25} y={-h + 12 + r * 26} width={gx * 0.5} height={14} rx={2} fill="#cfe8ff" {...line} strokeWidth={2} />;
      })}
      <rect x={-9} y={-22} width={18} height={22} fill="#8a5a2b" {...line} strokeWidth={2.5} />
    </g>
  );
}

// A little shop with a striped awning. (x, y) is the bottom centre.
export function Shop(p: At) {
  return (
    <g transform={place(p)}>
      <rect x={-75} y={-90} width={150} height={90} fill="#fff4e3" {...line} />
      <path d="M-85 -90 H85 L75 -120 H-75 Z" fill="#e8452c" {...line} />
      {[-55, -25, 5, 35].map((sx) => (
        <path key={sx} d={`M${sx} -90 L${sx + 4} -120 H${sx + 18} L${sx + 15} -90 Z`} fill="white" />
      ))}
      <path d="M-85 -90 H85 L75 -120 H-75 Z" fill="none" {...line} />
      <rect x={-60} y={-70} width={60} height={40} rx={3} fill="#cfe8ff" {...line} strokeWidth={2.5} />
      <rect x={18} y={-62} width={40} height={62} rx={3} fill="#8a5a2b" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Lock(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-18 -8 V-24 A18 18 0 0 1 18 -24 V-8" fill="none" stroke={LINE} strokeWidth={8} />
      <path d="M-18 -8 V-24 A18 18 0 0 1 18 -24 V-8" fill="none" stroke="#b9b9b9" strokeWidth={3} />
      <rect x={-28} y={-10} width={56} height={44} rx={6} fill="#f5c542" {...line} />
      <circle cy={8} r={5} fill={INK} />
      <rect x={-2} y={8} width={4} height={12} fill={INK} />
    </g>
  );
}

export function Car({ color = "#e8452c", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <path d="M-62 10 V-6 Q-60 -14 -44 -16 L-24 -34 H22 L40 -16 Q60 -14 62 -4 V10 Z" fill={color} {...line} />
      <path d="M-18 -28 H-2 V-16 H-32 Z M4 -28 H18 L32 -16 H4 Z" fill="#cfe8ff" {...line} strokeWidth={2} />
      <circle cx={-36} cy={12} r={11} fill={INK} />
      <circle cx={36} cy={12} r={11} fill={INK} />
      <circle cx={-36} cy={12} r={4} fill="#ddd" />
      <circle cx={36} cy={12} r={4} fill="#ddd" />
    </g>
  );
}

export function Bike({ color = "#4a7fd4", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <circle cx={-30} cy={10} r={18} fill="none" {...line} />
      <circle cx={30} cy={10} r={18} fill="none" {...line} />
      <path d="M-30 10 L-8 -18 H20 L30 10 M-8 -18 L4 10 L20 -18 M-12 -26 H-2 M20 -18 L16 -30 H26" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={4} cy={10} r={3} fill={INK} />
    </g>
  );
}

export function Flag({ color = "#e8452c", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <line x1={0} y1={0} x2={0} y2={-56} {...line} />
      <path d="M0 -56 L34 -46 L0 -36 Z" fill={color} {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Magnifier(p: At) {
  return (
    <g transform={place(p)}>
      <line x1={14} y1={14} x2={34} y2={34} stroke={LINE} strokeWidth={9} strokeLinecap="round" />
      <circle r={22} fill="#e9f5ff" {...line} />
      <path d="M-10 -8 Q-8 -14 -2 -15" fill="none" stroke="white" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

export function Megaphone(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-30 -10 H-14 L22 -32 V32 L-14 10 H-30 Z" fill="#e8452c" {...line} />
      <path d="M-24 10 L-18 30 H-8 L-12 10" fill="#f5c542" {...line} strokeWidth={2.5} />
      <path d="M32 -14 Q40 0 32 14 M40 -24 Q54 0 40 24" fill="none" {...line} />
    </g>
  );
}

// A storage box with a label, for TFSA/RRSP/FHSA. (x, y) is the bottom centre.
export function AccountBox({ color = "#f5c542", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <rect x={-48} y={-62} width={96} height={62} rx={4} fill={color} {...line} />
      <rect x={-54} y={-78} width={108} height={18} rx={4} fill={color} {...line} />
      <rect x={-26} y={-44} width={52} height={20} rx={4} fill="white" {...line} strokeWidth={2.5} />
    </g>
  );
}

export function Screen(p: At) {
  return (
    <g transform={place(p)}>
      <rect x={-110} y={-80} width={220} height={140} rx={10} fill="#2f3446" {...line} />
      <rect x={-98} y={-68} width={196} height={116} rx={4} fill="#f7fbff" />
      <path d="M-20 60 L-28 80 H28 L20 60 Z" fill="#c9c9c9" {...line} />
    </g>
  );
}

export function Plate(p: At) {
  return (
    <g transform={place(p)}>
      <circle r={78} fill="white" {...line} />
      <circle r={62} fill="#f6f6f6" stroke="#dddddd" strokeWidth={2} />
    </g>
  );
}

// A big cooking pot (the mutual fund "pot"). (x, y) is the top centre.
export function Pot(p: At) {
  return (
    <g transform={place(p)}>
      <path d="M-70 0 H70 Q66 70 0 74 Q-66 70 -70 0 Z" fill="#555c6e" {...line} />
      <rect x={-78} y={-8} width={156} height={14} rx={6} fill="#6b7387" {...line} />
      <path d="M-78 4 h-12 M78 4 h12" {...line} strokeWidth={6} />
    </g>
  );
}

export function Calendar({ month, ...p }: At & { month: string }) {
  return (
    <g transform={place(p)}>
      <rect x={-34} y={-30} width={68} height={60} rx={6} fill="white" {...line} />
      <path d="M-34 -24 Q-34 -30 -28 -30 H28 Q34 -30 34 -24 V-10 H-34 Z" fill="#e8452c" {...line} />
      <text y={14} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>
        {month}
      </text>
      <path d="M-18 -36 V-24 M18 -36 V-24" {...line} />
    </g>
  );
}

// Full-body bull silhouette, facing right, head down to charge. About 220 x 120 at s=1.
export function Bull({ color = "#2b2b2b", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)}>
      <path d="M32 54 C14 50 8 66 12 84" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d="M12 82 l-5 10 l9 -4 z" fill={color} />
      <path
        d="M30 50 C34 38 60 34 90 36 C110 20 140 8 162 16 C176 22 184 36 186 50 C192 56 200 62 204 72 C208 82 204 92 194 92 C186 92 180 88 176 84 C170 86 166 84 162 80 C160 90 160 98 164 104 L166 116 L156 118 L150 98 L142 100 L140 116 L130 118 L128 96 C110 98 92 96 80 92 L74 112 L64 114 L64 92 C58 94 52 94 48 92 L46 112 L36 114 L34 86 C26 78 26 62 30 50 Z"
        fill={color}
      />
      <path d="M180 56 C182 42 194 34 202 36 C194 40 188 46 186 58 Z" fill="#e9dcbc" stroke={color} strokeWidth={1.5} />
      <path d="M188 60 C194 46 206 42 214 46 C206 48 200 54 196 64 Z" fill="#f3e7c9" stroke={color} strokeWidth={1.5} />
    </g>
  );
}

// Full-body bear silhouette, facing left. About 190 x 120 at s=1.
export function Bear({ color = "#2b2b2b", ...p }: At & { color?: string }) {
  return (
    <g transform={place(p)} fill={color}>
      <path d="M70 40 C90 24 110 22 124 26 C152 28 176 40 184 62 C188 76 186 90 182 96 L182 114 L170 116 L168 98 L152 96 L152 114 L140 116 L138 94 C120 96 104 96 92 92 L92 114 L80 116 L78 92 L70 90 L68 114 L56 116 L58 80 C56 66 60 50 70 40 Z" />
      <ellipse cx={54} cy={58} rx={22} ry={19} />
      <circle cx={62} cy={40} r={7} />
      <circle cx={47} cy={41} r={6} />
      <ellipse cx={33} cy={65} rx={14} ry={9} />
      <circle cx={44} cy={54} r={2} fill="#bbbbbb" />
    </g>
  );
}

// A price line with a dark outline.
export function ColorLine({ points, color }: { points: string; color: string }) {
  const base = { fill: "none", stroke: LINE, strokeWidth: 11, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <g>
      <polyline points={points} {...base} />
      <polyline points={points} {...base} stroke={color} strokeWidth={6} />
    </g>
  );
}

// A pie chart. parts = [percent, colour][]
export function Pie({ cx, cy, r, parts }: { cx: number; cy: number; r: number; parts: [number, string][] }) {
  const starts = parts.map((_, i) => -90 + parts.slice(0, i).reduce((sum, [pct]) => sum + pct * 3.6, 0));
  return (
    <g>
      {parts.map(([pct, color], i) => {
        const a0 = (starts[i] * Math.PI) / 180;
        const a1 = ((starts[i] + pct * 3.6) * Math.PI) / 180;
        const large = pct > 50 ? 1 : 0;
        const d = `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        return <path key={color + pct} d={d} fill={color} stroke={LINE} strokeWidth={OUTLINE} strokeLinejoin="round" />;
      })}
    </g>
  );
}

// Coins and a bill floating above an account box.
export function MoneyBits({ x }: { x: number }) {
  return (
    <g>
      <Coin x={x - 26} y={60} s={0.8} />
      <Bill x={x + 14} y={58} s={0.75} />
      <Arrow x1={x} y1={80} x2={x} y2={100} color="#9a9a9a" />
    </g>
  );
}
