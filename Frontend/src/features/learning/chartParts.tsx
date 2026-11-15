// Small, clean chart pieces for the "See it" slide (charts.tsx).
// Style rules (kept the same everywhere): 2px lines, light area wash, thin columns
// with rounded tops, hairline grey grid, text always in grey/black (never the series colour),
// a legend when there are 2+ series. Hover any mark to see its value.

import type { ReactNode } from "react";
import { C } from "../../shared/chartColors";


export type Series = { name: string; color: string; values: number[]; area?: boolean; dashed?: boolean };
type Fmt = (n: number) => string;

const W = 600;

// ---------- frame + legend ----------

export function Figure({ title, legend, note, children }: { title: string; legend?: { name: string; color: string }[]; note?: string; children: ReactNode }) {
  return (
    <div className="chart">
      <div className="chart-head">
        <strong>{title}</strong>
        {legend && legend.length > 1 && (
          <ul className="chart-legend">
            {legend.map((l) => (
              <li key={l.name}>
                <span style={{ background: l.color }} />
                {l.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
      {note && <p className="chart-note">{note}</p>}
    </div>
  );
}

// ---------- line chart ----------

export function LineChart({
  series,
  xLabels,
  yMax,
  yMin = 0,
  ticks = 4,
  fmt = (n) => String(n),
  height = 250,
  marks = [],
  endLabels = true,
}: {
  series: Series[];
  xLabels: string[];
  yMax: number;
  yMin?: number;
  ticks?: number;
  fmt?: Fmt;
  height?: number;
  marks?: { i: number; s: number; label: string }[];
  endLabels?: boolean;
}) {
  const L = 56;
  const R = endLabels ? 86 : 20;
  const T = 14;
  const B = 30;
  const n = series[0].values.length;
  const x = (i: number) => L + (i * (W - L - R)) / (n - 1);
  const y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (height - T - B);
  const tickVals = Array.from({ length: ticks + 1 }, (_, k) => yMin + ((yMax - yMin) * k) / ticks);
  const labelEvery = Math.ceil(n / 8);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart-svg" role="img" aria-label={series.map((s) => s.name).join(" vs ")}>
      {tickVals.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={C.grid} strokeWidth={1} />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={C.muted}>
            {fmt(v)}
          </text>
        </g>
      ))}
      {xLabels.map((lab, i) =>
        lab && i % labelEvery === 0 ? (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={C.muted}>
            {lab}
          </text>
        ) : null,
      )}
      {series.map((s) => {
        const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (
          <g key={s.name}>
            {s.area && <polygon points={`${x(0)},${y(yMin)} ${pts} ${x(n - 1)},${y(yMin)}`} fill={s.color} opacity={0.1} />}
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? "6 6" : undefined} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={9} fill="transparent">
                <title>{`${s.name}, ${xLabels[i] || ""}: ${fmt(v)}`}</title>
              </circle>
            ))}
            <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={5} fill={s.color} stroke={C.surface} strokeWidth={2} />
            {endLabels && (
              <text x={x(n - 1) + 10} y={y(s.values[n - 1]) + 4} fontSize={13} fontWeight={700} fill={C.text}>
                {fmt(s.values[n - 1])}
              </text>
            )}
          </g>
        );
      })}
      {marks.map((m) => {
        const v = series[m.s].values[m.i];
        const above = m.i > 0 && v >= series[m.s].values[m.i - 1];
        return (
          <g key={m.label}>
            <circle cx={x(m.i)} cy={y(v)} r={6} fill={series[m.s].color} stroke={C.surface} strokeWidth={2} />
            <text x={x(m.i)} y={above ? y(v) - 14 : y(v) + 24} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.text}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- columns (optionally stacked) ----------

export function Columns({
  items,
  max,
  fmt = (n) => String(n),
  height = 240,
  width = W,
}: {
  items: { label: string; parts: { name: string; value: number; color: string }[]; top?: string }[];
  max: number;
  fmt?: Fmt;
  height?: number;
  width?: number;
}) {
  const T = 26;
  const B = 30;
  const band = (width - 40) / items.length;
  const bw = Math.min(40, band * 0.5);
  const h = (v: number) => (v / max) * (height - T - B);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="column chart">
      <line x1={20} x2={width - 20} y1={height - B} y2={height - B} stroke={C.grid} strokeWidth={1} />
      {items.map((it, i) => {
        const cx = 20 + band * i + band / 2;
        let base = height - B;
        const total = it.parts.reduce((a, p) => a + p.value, 0);
        return (
          <g key={it.label}>
            {it.parts.map((p, k) => {
              const ph = h(p.value);
              const isTop = k === it.parts.length - 1;
              const yTop = base - ph;
              const r = isTop ? Math.min(5, ph / 2) : 0;
              const d = `M${cx - bw / 2} ${base} V${yTop + r} Q${cx - bw / 2} ${yTop} ${cx - bw / 2 + r} ${yTop} H${cx + bw / 2 - r} Q${cx + bw / 2} ${yTop} ${cx + bw / 2} ${yTop + r} V${base} Z`;
              const el = (
                <path key={p.name} d={d} fill={p.color}>
                  <title>{`${it.label}, ${p.name}: ${fmt(p.value)}`}</title>
                </path>
              );
              base = yTop - (isTop ? 0 : 2);
              return el;
            })}
            <text x={cx} y={height - B - h(total) - (it.parts.length - 1) * 2 - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.text}>
              {it.top ?? fmt(total)}
            </text>
            <text x={cx} y={height - 10} textAnchor="middle" fontSize={12} fill={C.text2}>
              {it.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- horizontal bars ----------

export function HBars({
  items,
  max,
  fmt = (n) => String(n),
  refLine,
}: {
  items: { label: string; value: number; color: string }[];
  max: number;
  fmt?: Fmt;
  refLine?: { value: number; label: string };
}) {
  const L = 130;
  const R = 60;
  const rowH = 44;
  const height = items.length * rowH + 40;
  const x = (v: number) => L + (v / max) * (W - L - R);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart-svg" role="img" aria-label="bar chart">
      {items.map((it, i) => {
        const yy = 20 + i * rowH;
        const w = x(it.value) - L;
        return (
          <g key={it.label}>
            <text x={L - 12} y={yy + 17} textAnchor="end" fontSize={13} fill={C.text}>
              {it.label}
            </text>
            <path d={`M${L} ${yy} H${L + w - 5} Q${L + w} ${yy} ${L + w} ${yy + 5} V${yy + 19} Q${L + w} ${yy + 24} ${L + w - 5} ${yy + 24} H${L} Z`} fill={it.color}>
              <title>{`${it.label}: ${fmt(it.value)}`}</title>
            </path>
            <text x={L + w + 8} y={yy + 17} fontSize={13} fontWeight={700} fill={C.text}>
              {fmt(it.value)}
            </text>
          </g>
        );
      })}
      {refLine && (
        <g>
          <line x1={x(refLine.value)} x2={x(refLine.value)} y1={10} y2={height - 22} stroke={C.text2} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={x(refLine.value)} y={height - 6} textAnchor="middle" fontSize={12} fill={C.text2}>
            {refLine.label}
          </text>
        </g>
      )}
    </svg>
  );
}

// ---------- 100% stacked horizontal bars ----------

export function SplitBars({ rows }: { rows: { label: string; parts: { name: string; value: number; color: string }[] }[] }) {
  const L = 150;
  const R = 20;
  const rowH = 70;
  const height = rows.length * rowH + 10;
  const span = W - L - R;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart-svg" role="img" aria-label="split bars">
      {rows.map((r, i) => {
        const yy = 16 + i * rowH;
        const total = r.parts.reduce((a, p) => a + p.value, 0);
        let cx = L;
        return (
          <g key={r.label}>
            <text x={L - 12} y={yy + 20} textAnchor="end" fontSize={13} fontWeight={700} fill={C.text}>
              {r.label}
            </text>
            {r.parts.map((p, k) => {
              const w = (p.value / total) * span - (k < r.parts.length - 1 ? 2 : 0);
              const el = (
                <g key={p.name}>
                  <rect x={cx} y={yy} width={w} height={30} rx={k === 0 || k === r.parts.length - 1 ? 5 : 0} fill={p.color}>
                    <title>{`${r.label}, ${p.name}: ${p.value}%`}</title>
                  </rect>
                  {w > 60 && (
                    <text x={cx + w / 2} y={yy + 20} textAnchor="middle" fontSize={13} fontWeight={700} fill="#ffffff">
                      {p.value}%
                    </text>
                  )}
                </g>
              );
              cx += w + 2;
              return el;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- donut ----------

export function Donut({ parts, center, sub, size = 200, cx = 100, cy = 100 }: { parts: { name: string; value: number; color: string }[]; center: string; sub?: string; size?: number; cx?: number; cy?: number }) {
  const r = size * 0.4;
  const stroke = size * 0.14;
  const total = parts.reduce((a, p) => a + p.value, 0);
  const circ = 2 * Math.PI * r;
  const gap = parts.length > 1 ? 2 : 0;
  const offsets = parts.map((_, i) => parts.slice(0, i).reduce((a, p) => a + p.value, 0));
  return (
    <g>
      {parts.map((p, i) => {
        const len = (p.value / total) * circ - gap;
        return (
          <circle
            key={p.name + i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(len, 0.5)} ${circ}`}
            strokeDashoffset={-(offsets[i] / total) * circ}
            transform={`rotate(-90 ${cx} ${cy})`}
          >
            <title>{`${p.name}: ${p.value}`}</title>
          </circle>
        );
      })}
      <text x={cx} y={cy + (sub ? 2 : 8)} textAnchor="middle" fontSize={size * 0.13} fontWeight={800} fill={C.text}>
        {center}
      </text>
      {sub && (
        <text x={cx} y={cy + size * 0.11} textAnchor="middle" fontSize={11} fill={C.text2}>
          {sub}
        </text>
      )}
    </g>
  );
}

// ---------- simple flow (boxes with arrows) ----------

export function Flow({ steps }: { steps: { title: string; text: string; color: string }[] }) {
  const n = steps.length;
  const gapX = 34;
  const bw = (W - gapX * (n - 1) - 20) / n;
  return (
    <svg viewBox={`0 0 ${W} 170`} className="chart-svg" role="img" aria-label={steps.map((s) => s.title).join(" then ")}>
      {steps.map((s, i) => {
        const x = 10 + i * (bw + gapX);
        return (
          <g key={s.title}>
            <rect x={x} y={20} width={bw} height={120} rx={12} fill="#f7f7f7" />
            <rect x={x} y={20} width={bw} height={6} rx={3} fill={s.color} />
            <text x={x + bw / 2} y={66} textAnchor="middle" fontSize={16} fontWeight={800} fill={C.text}>
              {s.title}
            </text>
            {s.text.split("\n").map((line, k) => (
              <text key={k} x={x + bw / 2} y={92 + k * 18} textAnchor="middle" fontSize={13} fill={C.text2}>
                {line}
              </text>
            ))}
            {i < n - 1 && (
              <g stroke={C.text2} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1={x + bw + 6} y1={80} x2={x + bw + gapX - 6} y2={80} />
                <polyline points={`${x + bw + gapX - 12},74 ${x + bw + gapX - 6},80 ${x + bw + gapX - 12},86`} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- comparison table (HTML) ----------

export function CompareTable({ cols, rows }: { cols: { name: string; color: string }[]; rows: { label: string; cells: string[] }[] }) {
  return (
    <table className="chart-table">
      <thead>
        <tr>
          <th />
          {cols.map((c) => (
            <th key={c.name}>
              <span className="chart-chip" style={{ background: c.color }} />
              {c.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            {r.cells.map((cell, i) => (
              <td key={i} className={cell === "Yes" ? "yes" : cell === "No" ? "no" : ""}>
                {cell === "Yes" ? "✓ Yes" : cell === "No" ? "✗ No" : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------- mosaic of small tiles (e.g. what's inside an ETF) ----------

export function Mosaic({ tiles, cols = 10, block }: { tiles: { label: string; color: string }[]; cols?: number; block?: { label: string; color: string; rows: number } }) {
  const size = (W - 20) / cols;
  if (block) {
    // one big tile the same size as a cols x rows grid (e.g. "all your money in 1 company")
    const h = block.rows * size;
    return (
      <svg viewBox={`0 0 ${W} ${h + 10}`} className="chart-svg" role="img" aria-label={block.label}>
        <rect x={12} y={7} width={W - 24} height={h - 4} rx={8} fill={block.color} opacity={0.9}>
          <title>{block.label}</title>
        </rect>
        <text x={W / 2} y={5 + h / 2 + 10} textAnchor="middle" fontSize={30} fontWeight={700} fill="#ffffff">
          {block.label}
        </text>
      </svg>
    );
  }
  const rows = Math.ceil(tiles.length / cols);
  return (
    <svg viewBox={`0 0 ${W} ${rows * size + 10}`} className="chart-svg" role="img" aria-label="many small holdings">
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={10 + (i % cols) * size + 2} y={5 + Math.floor(i / cols) * size + 2} width={size - 4} height={size - 4} rx={6} fill={t.color} opacity={0.9}>
            <title>{t.label || "a company"}</title>
          </rect>
        </g>
      ))}
    </svg>
  );
}
