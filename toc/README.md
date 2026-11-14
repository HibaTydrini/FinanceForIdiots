# Table of Contents (Cindy)

`/learn` shows the table of contents: 40 topics in 7 chapters. Click a topic to
expand it: explanation at the chosen level (novice / intermediate / expert), a
"Try it" idea, an "I've learned this" checkbox, a link to the full lesson when
there is one, and small source links at the bottom (National Bank first).
There is a search box and a level switch at the top.

Topics live in `toc/topics.json`. To add a topic, copy one entry and change it.

**AWS S3 (optional):** set `TOC_S3_BUCKET` (and `TOC_S3_PREFIX`) and the app reads
`topics.json` from S3 instead of the local file (code: `toc/topics.py`). Setup:
`aws configure`, then `aws s3 mb s3://<bucket>` and
`aws s3 cp toc/topics.json s3://<bucket>/<prefix>/topics.json`.

The personalized plan (sorting per user) is kept for later at `/learn/plan`.

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
| `toc/topics.json` | All table-of-contents topics, 3 levels, sources. |
| `toc/topics.py` | Loads topics (local or AWS S3) and builds the table of contents |
| `templates/contents.html` | The expandable table of contents page |
| `toc/lessons.py` | Full lesson pages (linked from matching topics). |
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
