# Table of Contents (Cindy)

The personalized learning plan: takes the user's questionnaire answers and builds an
ordered list of lessons that explain investing concepts in detail.

## Run it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py                 # open http://127.0.0.1:5001/learn
python -m pytest              # run tests
```

Preview different users with `/learn?demo=beginner`, `?demo=homebuyer`, `?demo=investor`.

## Files

| File | What it does |
|---|---|
| `toc/lessons.py` | All lesson content (7 modules, 23 lessons). Add lessons here. |
| `toc/personalize.py` | `build_toc(profile)` turns a profile into the personalized TOC |
| `toc/routes.py` | Pages (`/learn`, `/learn/<id>`) and JSON API |
| `toc/ai_hook.py` | `explain()`: placeholder for the AI agent to answer "explain this to me" |
| `templates/toc.html`, `templates/lesson.html` | The two pages |
| `static/js/progress.js` | Progress tracking (localStorage), quiz, ask box |

## For teammates

**Questionnaire →** produce this dict, then `from toc import save_profile; save_profile(profile)`
and redirect to `/learn`:

```python
{
  "name": "Cindy",
  "experience": "none" | "beginner" | "intermediate" | "advanced",
  "goals": ["retirement", "house", "emergency_fund", "grow_wealth", "education", "income"],
  "horizon_years": 10,
  "risk_tolerance": "low" | "medium" | "high",
  "has_portfolio": True,
  "accounts": ["tfsa", "rrsp", "fhsa", "resp", "non_registered"],
}
```

**AI agent →** replace the body of `explain()` in `toc/ai_hook.py`. `build_prompt()` already
packages the lesson + profile as context.

**Anyone →** `POST /api/toc` with a profile JSON returns the TOC as JSON;
`GET /api/lessons/<id>` returns a lesson.
