# Table of Contents (Cindy)

Builds a personalized table of contents from the user's answers to the opening quiz.
Each entry opens a lesson that explains the concept in detail.

## Run it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py                 # open http://127.0.0.1:5001/learn
python -m pytest              # run tests
```

Preview different users with `/learn?demo=beginner`, `?demo=homebuyer`, `?demo=crypto`.

## Topics

| Module | Lessons |
|---|---|
| Investing 101 | What is investing, compound growth, risk & return, diversification |
| Stocks, ETFs & Mutual Funds | Stocks, ETFs & index funds, mutual funds & fees, bonds & GICs |
| Crypto & Bitcoin | What is crypto, Bitcoin, buying crypto safely in Canada |
| TFSA, RRSP & FHSA | One lesson per account |
| Taxes | How investments are taxed, TFSA vs RRSP |

Each lesson is marked **Core** (everyone), **For you** (matches their answers) or
**Optional**. "My plan" shows Core + For you; "All lessons" shows everything.

## Files

| File | What it does |
|---|---|
| `toc/lessons.py` | All lesson content. Add or edit lessons here. |
| `toc/personalize.py` | `build_toc(profile)`: quiz answers → personalized TOC |
| `toc/routes.py` | Pages (`/learn`, `/learn/<id>`) and JSON API |
| `templates/toc.html`, `templates/lesson.html` | The two pages |
| `static/js/progress.js` | Remembers which lessons are completed |

## Connecting the opening quiz

The quiz should produce this dict (every field optional), then call
`from toc import save_profile; save_profile(answers)` and redirect to `/learn`:

```python
{
  "name": "Cindy",
  "experience": "none" | "beginner" | "intermediate" | "advanced",
  "goals": ["retirement", "house", "grow_wealth", "income", "short_term"],
  "interests": ["stocks", "etfs", "mutual_funds", "crypto", "bitcoin", "tfsa", "rrsp", "fhsa", "taxes"],
  "horizon_years": 10,
  "risk_tolerance": "low" | "medium" | "high",
  "has_portfolio": True,
  "accounts": ["tfsa", "rrsp", "fhsa"],
}
```

Or call the API: `POST /api/toc` with that JSON returns the TOC as JSON.
