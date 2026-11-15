// Building blocks for the drawn scenes (people, coins, cards, eggs...).

import type { ReactNode } from "react";
import { INK, AQUA, SKIN, HAIR } from "./sceneColors";

// ---------- small building blocks ----------

export function T({ x, y, children, size = 14, weight = 400, color = INK, anchor = "middle" }: { x: number; y: number; children: ReactNode; size?: number; weight?: number; color?: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>
      {children}
    </text>
  );
}

export function Shadow({ x, y, w }: { x: number; y: number; w: number }) {
  return <ellipse cx={x} cy={y} rx={w / 2} ry={w / 14} fill={INK} opacity={0.08} />;
}

export function Person({ x, y, s = 1, shirt, k = 0, tie }: { x: number; y: number; s?: number; shirt: string; k?: number; tie?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy={2} rx={26} ry={4} fill={INK} opacity={0.08} />
      <path d="M-22 0 V-36 Q-22 -60 0 -60 Q22 -60 22 -36 V0 Z" fill={shirt} />
      {tie && <path d="M0 -58 L-5 -50 L0 -28 L5 -50 Z" fill={tie} />}
      <rect x={-5} y={-66} width={10} height={8} fill={SKIN[k % 4]} />
      <circle cy={-78} r={15} fill={SKIN[k % 4]} />
      <path d="M-15.5 -78 A15.5 15.5 0 0 1 15.5 -78 Q6 -86 -15.5 -78 Z" fill={HAIR[k % 4]} />
    </g>
  );
}

export function Coin({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y + 2} r={r} fill="#c98900" />
      <circle cx={x} cy={y} r={r} fill="#f5b524" />
      <circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="#d99a0b" strokeWidth={1.5} />
      <text x={x} y={y + r * 0.38} fontSize={r * 1.05} fontWeight={700} fill="#a86f00" textAnchor="middle">
        $
      </text>
    </g>
  );
}

export function CoinStack({ x, y, n, r = 16 }: { x: number; y: number; n: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <ellipse cx={x} cy={y - i * 7 + 3} rx={r} ry={r * 0.38} fill="#c98900" />
          <ellipse cx={x} cy={y - i * 7} rx={r} ry={r * 0.38} fill={i === n - 1 ? "#f5b524" : "#e9a714"} />
        </g>
      ))}
    </g>
  );
}

export function Card({ x, y, w, h, fill = "#ffffff" }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y + 4} width={w} height={h} rx={14} fill={INK} opacity={0.06} />
      <rect x={x} y={y} width={w} height={h} rx={14} fill={fill} />
    </g>
  );
}

export function Pill({ x, y, text, color, light }: { x: number; y: number; text: string; color: string; light: string }) {
  const w = text.length * 7.4 + 24;
  return (
    <g>
      <rect x={x - w / 2} y={y - 15} width={w} height={26} rx={13} fill={light} />
      <T x={x} y={y + 3} size={13} weight={600} color={color}>
        {text}
      </T>
    </g>
  );
}

// little company logos: white shape on a coloured tile
export function Logo({ x, y, size, color, kind }: { x: number; y: number; size: number; color: string; kind: number }) {
  const c = size / 2;
  const shapes = [
    <circle key="c" cx={x + c} cy={y + c} r={size * 0.2} fill="#ffffff" />,
    <path key="t" d={`M${x + c} ${y + size * 0.28} L${x + size * 0.72} ${y + size * 0.7} L${x + size * 0.28} ${y + size * 0.7} Z`} fill="#ffffff" />,
    <rect key="s" x={x + size * 0.3} y={y + size * 0.3} width={size * 0.4} height={size * 0.4} rx={3} fill="#ffffff" />,
    <path key="w" d={`M${x + size * 0.24} ${y + c} q${size * 0.13} ${-size * 0.18} ${size * 0.26} 0 t${size * 0.26} 0`} stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" />,
  ];
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.22} fill={color} />
      {shapes[kind % 4]}
    </g>
  );
}

export function Check({ x, y, on = true }: { x: number; y: number; on?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={18} height={18} rx={5} fill={on ? AQUA : "#eeeeee"} />
      {on && <path d={`M${x + 4.5} ${y + 9.5} l3.5 3.5 l6 -7`} stroke="#ffffff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
}

export function Arrow({ d, color = "#b5b5b5" }: { d: string; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="2 7" strokeLinecap="round" />;
}

export function Head({ x, y, color, dir }: { x: number; y: number; color: string; dir: "r" | "d" | "u" }) {
  const rot = dir === "r" ? 0 : dir === "d" ? 90 : -90;
  return <path d="M-7 -6 L1 0 L-7 6" transform={`translate(${x} ${y}) rotate(${rot})`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

export function Svg({ label, children, h = 300 }: { label: string; children: ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 600 ${h}`} role="img" aria-label={label} className="scene">
      {children}
    </svg>
  );
}

// ---------- eggs and baskets (diversification) ----------

export function Egg({ x, y, broken }: { x: number; y: number; broken?: boolean }) {
  if (broken) {
    return (
      <g>
        <path d={`M${x - 14} ${y} Q${x - 14} ${y - 18} ${x - 4} ${y - 18} L${x - 1} ${y - 10} L${x - 7} ${y - 4} Z`} fill="#fbf3e6" />
        <path d={`M${x + 2} ${y - 18} Q${x + 14} ${y - 16} ${x + 14} ${y} L${x + 4} ${y - 6} L${x + 7} ${y - 12} Z`} fill="#f1e2c9" />
        <ellipse cx={x} cy={y + 3} rx={17} ry={5} fill="#f7c948" opacity={0.9} />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx={13} ry={17} fill="#fbf3e6" />
      <ellipse cx={x + 4} cy={y + 3} rx={8} ry={12} fill="#f1e2c9" />
      <ellipse cx={x - 5} cy={y - 7} rx={3} ry={5} fill="#ffffff" />
    </g>
  );
}

export function Basket({ x, y, w }: { x: number; y: number; w: number }) {
  const h = w * 0.42;
  return (
    <g>
      <path d={`M${x - w / 2} ${y - h / 2} L${x + w / 2} ${y - h / 2} L${x + w * 0.4} ${y + h / 2} L${x - w * 0.4} ${y + h / 2} Z`} fill="#c9853f" />
      {[0.15, 0.5, 0.85].map((f) => (
        <line key={f} x1={x - w / 2 + w * 0.1 * f} x2={x + w / 2 - w * 0.1 * f} y1={y - h / 2 + h * f} y2={y - h / 2 + h * f} stroke="#a96a2d" strokeWidth={3} />
      ))}
      <rect x={x - w / 2 - 6} y={y - h / 2 - 8} width={w + 12} height={12} rx={6} fill="#a96a2d" />
    </g>
  );
}
