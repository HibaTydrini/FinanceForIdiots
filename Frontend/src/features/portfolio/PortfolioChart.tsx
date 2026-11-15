// Interactive "your account over time" graph for the demo portfolios.
// Hover (or touch, or use the arrow keys) to see what the account was worth on a day and how much
// had been put in by then. The buttons under the graph change the time range.
// Data is one point per trading day (closing prices), from scripts/build_demo_accounts.py.

import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "../../shared/chartColors";

export type DailyHistory = { date: string[]; value: number[]; invested: number[] };

const RANGES = [
  { id: "1D", label: "1D", name: "Past day" },
  { id: "1W", label: "1W", name: "Past week" },
  { id: "3M", label: "3M", name: "Past 3 months" },
  { id: "6M", label: "6M", name: "Past 6 months" },
  { id: "1Y", label: "1Y", name: "Past year" },
  { id: "YTD", label: "YTD", name: "Year to date" },
  { id: "ALL", label: "All", name: "Since you started" },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 52 };

const cents = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
// axis labels: as short as possible while still telling neighbouring gridlines apart
function axisMoney(n: number, step: number) {
  if (n < 1000 || step < 100) return `$${Math.round(n).toLocaleString("en-CA")}`;
  const decimals = step >= 1000 ? 0 : step >= 100 ? 1 : 2;
  return `$${(n / 1000).toFixed(decimals)}k`;
}
const signed = (n: number) => `${n >= 0 ? "+" : "-"}${cents(Math.abs(n))}`;

function parse(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}
function longDate(d: string) {
  return parse(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function shortDate(d: string, withYear: boolean) {
  return parse(d).toLocaleDateString("en-CA", {
    month: "short",
    ...(withYear ? { year: "numeric" } : { day: "numeric" }),
    timeZone: "UTC",
  });
}

// index of the first point in the range; one point before the range start is kept as the baseline
function rangeStart(dates: string[], range: RangeId) {
  const n = dates.length;
  if (range === "ALL") return 0;
  if (range === "1D") return Math.max(0, n - 2);
  const end = parse(dates[n - 1]);
  const from = new Date(end);
  if (range === "1W") from.setUTCDate(from.getUTCDate() - 7);
  if (range === "3M") from.setUTCMonth(from.getUTCMonth() - 3);
  if (range === "6M") from.setUTCMonth(from.getUTCMonth() - 6);
  if (range === "1Y") from.setUTCFullYear(from.getUTCFullYear() - 1);
  if (range === "YTD") from.setUTCMonth(0, 1);
  const first = dates.findIndex((d) => parse(d) >= from);
  return first <= 0 ? 0 : first - 1;
}

function niceStep(span: number) {
  const raw = span / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
}

export default function PortfolioChart({ daily }: { daily: DailyHistory }) {
  const [range, setRange] = useState<RangeId>("1Y");
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = useMemo(() => {
    const s = rangeStart(daily.date, range);
    const date = daily.date.slice(s);
    const value = daily.value.slice(s);
    const invested = daily.invested.slice(s);
    // zoom on the worth line (like banking apps); the money-put-in line shows when it fits in the window
    let lo = Math.min(...value);
    let hi = Math.max(...value);
    if (hi - lo < hi * 0.01) {
      lo -= hi * 0.01;
      hi += hi * 0.01;
    }
    const step = niceStep(hi - lo);
    const yMin = Math.max(0, Math.floor(lo / step) * step);
    const yMax = Math.ceil(hi / step) * step;
    const ticks: number[] = [];
    for (let t = yMin; t <= yMax + step / 2; t += step) ticks.push(t);
    const investedShows = invested.some((v) => v >= yMin && v <= yMax);
    return { date, value, invested, yMin, yMax, ticks, step, investedShows };
  }, [daily, range]);

  const n = view.date.length;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - view.yMin) / (view.yMax - view.yMin)) * plotH;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const last = n - 1;
  const at = hover ?? last;
  const deposits = view.invested[at] - view.invested[0];
  const gain = view.value[at] - view.value[0] - deposits;
  const base = view.value[0] + deposits;
  const gainPct = base > 0 ? (gain / base) * 100 : 0;
  const rangeName = RANGES.find((r) => r.id === range)!.name;
  const spansYears = parse(view.date[last]).getTime() - parse(view.date[0]).getTime() > 400 * 864e5;

  // up to 5 date labels along the bottom
  const fractions = width < 520 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
  const xTicks = n < 2 ? [0] : Array.from(new Set(fractions.map((f) => Math.round(f * last))));

  function pointFromEvent(clientX: number) {
    const rect = boxRef.current!.getBoundingClientRect();
    const px = clientX - rect.left - PAD.left;
    const i = Math.round((px / plotW) * last);
    setHover(Math.min(last, Math.max(0, i)));
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const d = e.key === "ArrowLeft" ? -1 : 1;
      setHover((h) => Math.min(last, Math.max(0, (h ?? last) + d)));
    } else if (e.key === "Escape") {
      setHover(null);
    }
  }

  const hx = x(at);
  const tipLeft = hx > width / 2;
  // keep the tooltip away from the line: low on the graph when the point is high, and the other way round
  const tipLow = y(view.value[at]) < PAD.top + plotH / 2;
  const inView = (v: number) => v >= view.yMin && v <= view.yMax;

  return (
    <section className="pchart">
      <div className="pchart-head">
        <span className="pchart-label">{hover === null ? "Worth today" : `Worth on ${longDate(view.date[at])}`}</span>
        <strong className="pchart-value">{cents(view.value[at])}</strong>
        <span className={`pchart-change ${gain >= 0 ? "up" : "down"}`}>
          {signed(gain)} ({gainPct >= 0 ? "+" : ""}
          {gainPct.toFixed(2)}%)
          <em>{hover === null ? rangeName.toLowerCase() : `since ${longDate(view.date[0])}`}</em>
        </span>
      </div>

      <div className="pchart-legend">
        <span>
          <i style={{ background: C.blue }} /> Worth
        </span>
        {view.investedShows && (
          <span>
            <i className="dashed" /> Money put in
          </span>
        )}
      </div>

      <div
        ref={boxRef}
        className="pchart-plot"
        tabIndex={0}
        role="img"
        aria-label={`Account worth, ${rangeName.toLowerCase()}: from ${cents(view.value[0])} to ${cents(view.value[last])}. Use the left and right arrow keys to read each day.`}
        onPointerMove={(e) => pointFromEvent(e.clientX)}
        onPointerDown={(e) => pointFromEvent(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={HEIGHT} className="pchart-svg">
          {view.ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={C.grid} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="pchart-axis">
                {axisMoney(t, view.step)}
              </text>
            </g>
          ))}
          {xTicks.map((i, k) => (
            <text
              key={i}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor={k === 0 ? "start" : i === last ? "end" : "middle"}
              className="pchart-axis"
            >
              {shortDate(view.date[i], spansYears)}
            </text>
          ))}

          <path d={`${path(view.value)}L${x(last)},${y(view.yMin)}L${x(0)},${y(view.yMin)}Z`} fill={C.blue} opacity={0.08} />
          <defs>
            <clipPath id="pchart-clip">
              <rect x={PAD.left} y={PAD.top - 2} width={plotW} height={plotH + 4} />
            </clipPath>
          </defs>
          <path
            d={path(view.invested)}
            clipPath="url(#pchart-clip)"
            fill="none"
            stroke="#9a9a9a"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <path d={path(view.value)} fill="none" stroke={C.blue} strokeWidth={2} strokeLinejoin="round" />

          {hover !== null && (
            <g>
              <line x1={hx} x2={hx} y1={PAD.top} y2={PAD.top + plotH} stroke="#252525" strokeOpacity={0.35} />
              {inView(view.invested[at]) && (
                <circle cx={hx} cy={y(view.invested[at])} r={4.5} fill="#9a9a9a" stroke="#fff" strokeWidth={2} />
              )}
              <circle cx={hx} cy={y(view.value[at])} r={5.5} fill={C.blue} stroke="#fff" strokeWidth={2} />
            </g>
          )}
          {n === 2 && hover === null && <circle cx={x(last)} cy={y(view.value[last])} r={4.5} fill={C.blue} />}
        </svg>

        {hover !== null && (
          <div
            className="pchart-tip"
            style={{
              ...(tipLeft ? { right: width - hx + 12 } : { left: hx + 12 }),
              ...(tipLow ? { bottom: PAD.bottom + 6 } : { top: 10 }),
            }}
          >
            <strong>{longDate(view.date[at])}</strong>
            <span>
              <i style={{ background: C.blue }} /> Worth <b>{cents(view.value[at])}</b>
            </span>
            <span>
              <i className="dashed" /> Money put in <b>{cents(view.invested[at])}</b>
            </span>
            <span className={view.value[at] - view.invested[at] >= 0 ? "up" : "down"}>
              Gain so far <b>{signed(view.value[at] - view.invested[at])}</b>
            </span>
          </div>
        )}
      </div>

      <div className="pchart-ranges" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={r.id === range ? "active" : ""}
            aria-pressed={r.id === range}
            onClick={() => {
              setRange(r.id);
              setHover(null);
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {range === "1D" && (
        <p className="pchart-note">The demo uses end-of-day prices, so 1D compares the last two closing prices.</p>
      )}
    </section>
  );
}
