"""Work out the real numbers for the pretend National Bank clients.

Reads:   src/data/demoClients.json (the pretend clients and what they own)
         the datathon starter files (prices, dividends, USD/CAD, macro)
Writes:  src/data/demoPortfolios.json (what the website and the AI coach use)

Usage (from the Frontend folder):
    pip install pandas
    python scripts/build_demo_accounts.py /path/to/datathon/files

The datathon CSV files stay outside the repo. Only the small summary is saved.
Everything is educational: pretend people, real historical prices.
"""

import json
import sys
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
DATA = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "datathon-data"
CLIENTS = HERE / "src" / "data" / "demoClients.json"
OUT = HERE / "src" / "data" / "demoPortfolios.json"


def load():
    prices = pd.read_csv(DATA / "prices_daily.csv", parse_dates=["date"])
    assets = pd.read_csv(DATA / "assets_universe.csv").set_index("ticker")
    actions = pd.read_csv(DATA / "corporate_actions.csv", parse_dates=["ex_date"])
    fx = pd.read_csv(DATA / "fx_usdcad_daily.csv", parse_dates=["date"]).set_index("date")["usdcad"]
    macro = pd.read_csv(DATA / "macro_rates.csv", parse_dates=["date"])
    return prices, assets, actions, fx, macro


def canada_inflation(macro, start):
    """About how much prices rose in Canada since `start`, from the y/y CPI series."""
    cpi = macro[macro.series_id == "STATIC_TOTALCPICHANGE"].set_index("date")["value"].sort_index()
    last = cpi.index[-1]
    total, d = 1.0, last
    while d - pd.DateOffset(months=12) >= start:
        total *= 1 + cpi.asof(d) / 100
        d = d - pd.DateOffset(months=12)
    months_left = (d.year - start.year) * 12 + d.month - start.month
    total *= 1 + cpi.asof(d) / 100 * months_left / 12
    return total - 1, last


def build_client(c, prices, assets, actions, fx, macro):
    start = min(pd.Timestamp(h["bought"]) for h in c["holdings"])
    end = prices["date"].max()
    days = pd.bdate_range(start, end)  # weekdays; holidays and weekends use the last known price
    fxd = fx.reindex(fx.index.union(days)).sort_index().ffill().reindex(days)

    value = pd.DataFrame(index=days)
    today_mix = pd.DataFrame(index=days)
    invested = pd.Series(0.0, index=days)
    rows = []
    for h in c["holdings"]:
        t, n, bought = h["ticker"], h["shares"], pd.Timestamp(h["bought"])
        a = assets.loc[t]
        p = prices[prices.ticker == t].set_index("date")["close"]
        p = p.reindex(p.index.union(days)).sort_index().ffill().reindex(days)
        rate = fxd if a.currency == "USD" else pd.Series(1.0, index=days)
        held = days >= bought
        first = days[held][0]
        buy_price = float(p[first])
        cost = n * buy_price * float(rate[first])
        value[t] = (n * p * rate).where(held, 0.0)
        today_mix[t] = n * p * rate  # as if held the whole time: used for "how bumpy is the account today"
        invested += pd.Series(cost, index=days).where(held, 0.0)

        divs = actions[(actions.ticker == t) & (actions.action == "dividend") & (actions.ex_date > bought)]
        div_cad = sum(n * r.value * (float(fxd.asof(r.ex_date)) if a.currency == "USD" else 1.0) for r in divs.itertuples())

        now = float(value[t].iloc[-1])
        rows.append({
            "ticker": t, "name": a["name"], "assetClass": a.asset_class, "sector": a.sector,
            "currency": a.currency, "shares": n, "bought": h["bought"],
            "buyPrice": round(buy_price, 2), "lastPrice": round(float(p.iloc[-1]), 2),
            "costCad": round(cost, 2), "valueCad": round(now, 2),
            "gainPct": round((now / cost - 1) * 100, 1), "dividendsCad": round(div_cad, 2),
        })

    total = value.sum(axis=1)
    total_value = float(total.iloc[-1])
    total_cost = float(invested.iloc[-1])
    total_divs = sum(r["dividendsCad"] for r in rows)
    for r in rows:
        r["weightPct"] = round(r["valueCad"] / total_value * 100, 1)
    rows.sort(key=lambda r: -r["valueCad"])

    # "time-weighted" index: how the money already invested moved day to day (new buys don't count as gains)
    prev = value.shift(1)
    held_both = (prev > 0) & (value > 0)
    ret = (value.where(held_both).sum(axis=1) / prev.where(held_both).sum(axis=1) - 1).fillna(0)
    idx = (1 + ret).cumprod()
    drawdown = idx / idx.cummax() - 1
    worst_day = drawdown.idxmin()
    peak_day = idx[:worst_day].idxmax()
    vol = float(ret[1:].std() * (252 ** 0.5) * 100)
    # how bumpy today's holdings were over the last year (a recent big buy counts fully)
    last_year = today_mix.sum(axis=1).iloc[-253:].pct_change().dropna()
    vol_now = float(last_year.std() * (252 ** 0.5) * 100)
    y2022 = idx[idx.index.year == 2022]
    ret_2022 = float(y2022.iloc[-1] / idx[idx.index < "2022-01-01"].iloc[-1] - 1) if len(idx[idx.index < "2022-01-01"]) else float(y2022.iloc[-1] / y2022.iloc[0] - 1)

    def mix(key):
        m = {}
        for r in rows:
            m[r[key]] = m.get(r[key], 0) + r["weightPct"]
        return [{"name": k, "pct": round(v, 1)} for k, v in sorted(m.items(), key=lambda kv: -kv[1])]

    infl, infl_month = canada_inflation(macro, start)
    gain_pct = (total_value + total_divs - total_cost) / total_cost * 100

    monthly = pd.DataFrame({"value": total, "invested": invested}).resample("ME").last()
    history = [{"month": d.strftime("%Y-%m"), "value": round(float(v.value)), "invested": round(float(v.invested))} for d, v in monthly.iterrows()]

    facts = make_facts(c, rows, mix, vol_now, ret_2022, drawdown, gain_pct, infl)

    return {
        **{k: c[k] for k in ("id", "name", "age", "job", "account", "risk", "horizon", "goal", "preferences")},
        "asOf": end.strftime("%Y-%m-%d"),
        "since": start.strftime("%Y-%m-%d"),
        "totals": {
            "valueCad": round(total_value, 2), "investedCad": round(total_cost, 2),
            "dividendsCad": round(total_divs, 2), "gainPct": round(gain_pct, 1),
            "volatilityPct": round(vol_now, 1), "volatilitySinceStartPct": round(vol, 1), "return2022Pct": round(ret_2022 * 100, 1),
            "worstDropPct": round(float(drawdown.min()) * 100, 1),
            "worstDropFrom": peak_day.strftime("%Y-%m-%d"), "worstDropTo": worst_day.strftime("%Y-%m-%d"),
            "canadaInflationPct": round(infl * 100, 1), "inflationThrough": infl_month.strftime("%Y-%m"),
        },
        "holdings": rows,
        "mix": {"assetClass": mix("assetClass"), "sector": mix("sector"), "currency": mix("currency")},
        "history": history,
        "facts": facts,
    }


RISK_BANDS = {"Low to moderate": (0, 10), "Moderate": (6, 14), "High": (12, 100)}


def make_facts(c, rows, mix, vol, ret_2022, drawdown, gain_pct, infl):
    """Plain facts the coach can talk about. Facts, not advice."""
    facts = []
    top = rows[0]
    if top["weightPct"] >= 25:
        facts.append({"kind": "concentration", "level": "watch",
                      "text": f"{top['name']} is {top['weightPct']}% of the account. One company going badly would hurt a lot."})
    sector = mix("sector")[0]
    if sector["pct"] >= 35:
        facts.append({"kind": "sector", "level": "watch",
                      "text": f"{sector['pct']}% is in one sector: {sector['name']}."})
    crypto = sum(r["weightPct"] for r in rows if r["assetClass"] == "crypto")
    if crypto > 0:
        facts.append({"kind": "crypto", "level": "watch" if crypto > 10 else "info",
                      "text": f"Crypto is {round(crypto, 1)}% of the account. It can drop more than 50% in a year."})
    bonds = sum(r["weightPct"] for r in rows if r["assetClass"] == "etf_bond")
    facts.append({"kind": "bonds", "level": "info",
                  "text": f"Bonds are {round(bonds, 1)}% of the account."})
    usd = sum(r["weightPct"] for r in rows if r["currency"] == "USD")
    if usd >= 30:
        facts.append({"kind": "currency", "level": "info",
                      "text": f"{round(usd, 1)}% is in U.S. dollars, so the USD/CAD exchange rate moves the value too."})
    lo, hi = RISK_BANDS.get(c["risk"], (0, 100))
    if vol > hi:
        facts.append({"kind": "risk", "level": "watch",
                      "text": f"Over the last year, today's holdings moved about {round(vol)}% a year (volatility), which is bumpier than a '{c['risk']}' risk profile usually expects."})
    else:
        facts.append({"kind": "risk", "level": "good",
                      "text": f"Over the last year, today's holdings moved about {round(vol)}% a year (volatility), which fits a '{c['risk']}' risk profile."})
    facts.append({"kind": "drop", "level": "info",
                  "text": f"Its worst drop was {round(float(drawdown.min()) * 100)}% from a high point. In 2022 it returned {round(ret_2022 * 100)}%."})
    facts.append({"kind": "inflation", "level": "good" if gain_pct > infl * 100 else "watch",
                  "text": f"Including dividends it is up {round(gain_pct)}%, while prices in Canada rose about {round(infl * 100)}% over the same time."})
    energy = [r["name"] for r in rows if r["sector"] == "Energy"]
    if energy and any("ESG" in p for p in c["preferences"]):
        facts.append({"kind": "values", "level": "watch",
                      "text": f"{', '.join(energy)} are energy companies. Mateo cares about ESG, so he may want to check their environmental record (sustainability reports, news). The data alone can't tell."})
    recent = [r for r in rows if r["bought"] >= "2025-01-01" and r["assetClass"] == "equity"]
    for r in recent:
        facts.append({"kind": "recent-buy", "level": "watch",
                      "text": f"{r['name']} was bought recently ({r['bought']}) and is {r['gainPct']}% since. It is much more volatile than the rest of this account."})
    return facts


def agent_context(p):
    """A short text the AI coach gets before the chat starts."""
    t = p["totals"]
    lines = [
        f"Demo client (pretend person, not a real account): {p['name']}, {p['age']}, {p['job']}.",
        f"Account: {p['account']}. Risk profile: {p['risk']}. Horizon: {p['horizon']}. Goal: {p['goal']}.",
        f"Preferences: {'; '.join(p['preferences'])}.",
        f"As of {p['asOf']} (invested since {p['since']}): value ${t['valueCad']:,.0f} CAD, money put in ${t['investedCad']:,.0f}, dividends ${t['dividendsCad']:,.0f}, total gain {t['gainPct']}%.",
        f"Volatility of today's holdings over the last year {t['volatilityPct']}%/yr, worst drop {t['worstDropPct']}% ({t['worstDropFrom']} to {t['worstDropTo']}), 2022 return {t['return2022Pct']}%.",
        "Holdings: " + "; ".join(f"{h['ticker']} {h['name']} {h['weightPct']}% ({h['gainPct']:+}%)" for h in p["holdings"]) + ".",
        "Mix by type: " + ", ".join(f"{m['name']} {m['pct']}%" for m in p["mix"]["assetClass"]) + ".",
        "Mix by sector: " + ", ".join(f"{m['name']} {m['pct']}%" for m in p["mix"]["sector"]) + ".",
        "Facts to discuss: " + " ".join(f["text"] for f in p["facts"]),
        "Sources: Yahoo Finance prices, Bank of Canada FX and CPI (datathon starter dataset).",
    ]
    return "\n".join(lines)


def main():
    prices, assets, actions, fx, macro = load()
    clients = json.loads(CLIENTS.read_text())["clients"]
    out = []
    for c in clients:
        p = build_client(c, prices, assets, actions, fx, macro)
        p["agentContext"] = agent_context(p)
        out.append(p)
        t = p["totals"]
        print(f"{p['name']:7} value ${t['valueCad']:>10,.0f}  in ${t['investedCad']:>10,.0f}  gain {t['gainPct']:>6}%  vol {t['volatilityPct']}%  worst {t['worstDropPct']}%  2022 {t['return2022Pct']}%")
    OUT.write_text(json.dumps({
        "note": "Generated by scripts/build_demo_accounts.py. Pretend clients, real historical prices from the datathon starter dataset. Educational only.",
        "portfolios": out,
    }, indent=1))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
