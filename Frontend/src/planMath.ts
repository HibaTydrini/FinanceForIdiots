// Small illustrative calculations for Baby Steps (goal card, fee calculator).
// Nothing here is a forecast: every growth figure is an example and is labeled that way on screen.

// Yearly growth used for the "with growth" examples. An example only, not a promise.
export const EXAMPLE_GROWTH_PCT = 5;

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;

// Whole months from today to a "YYYY-MM-DD" date (at least 1).
export function monthsUntil(dateISO: string, todayISO: string): number {
  const [y1, m1, d1] = todayISO.split("-").map(Number);
  const [y2, m2, d2] = dateISO.split("-").map(Number);
  if (!y2 || !m2) return 1;
  const months = (y2 - y1) * 12 + (m2 - m1) + ((d2 || 1) < d1 ? -1 : 0);
  return Math.max(1, months);
}

// Monthly amount needed to reach `target` in `months`, if the money grew `yearlyPct` a year.
// With 0% it is simply target / months.
export function monthlyNeeded(target: number, months: number, yearlyPct = 0): number {
  const r = yearlyPct / 100 / 12;
  if (r === 0) return target / months;
  return (target * r) / (Math.pow(1 + r, months) - 1);
}

// What `monthly` contributions grow to after `years`, at `yearlyPct` a year (after fees).
export function futureValue(monthly: number, years: number, yearlyPct: number): number {
  const months = years * 12;
  const r = yearlyPct / 100 / 12;
  if (r === 0) return monthly * months;
  return (monthly * (Math.pow(1 + r, months) - 1)) / r;
}
