"""
Turns a user profile (from the questionnaire) into a personalized Table of Contents.

PROFILE CONTRACT (what the questionnaire team should produce)
-------------------------------------------------------------
{
    "name": "Cindy",                       # optional
    "experience": "none" | "beginner" | "intermediate" | "advanced",
    "goals": ["retirement", "house", "emergency_fund", "grow_wealth", "education", "income"],
    "horizon_years": 10,                   # when they'll need the money
    "risk_tolerance": "low" | "medium" | "high",
    "has_portfolio": True | False,
    "accounts": ["tfsa", "rrsp", "fhsa", "resp", "non_registered"]   # accounts they already have
}
Every field is optional; missing values fall back to DEFAULT_PROFILE.

OUTPUT
------
build_toc(profile) returns a dict ready for a template or JSON:
{
    "profile": {...normalized profile...},
    "style": {"label": "Balanced", "description": "..."},
    "modules": [
        {"id", "title", "description",
         "lessons": [{"id", "title", "summary", "minutes", "level",
                      "priority": "core" | "recommended" | "optional",
                      "reasons": ["Because you're saving for a home", ...]}]}
    ],
    "start_here": "<lesson id>",
    "total_minutes": 42,     # reading time for core + recommended lessons
}
"""

from copy import deepcopy

from .lessons import LESSONS, MODULES

DEFAULT_PROFILE = {
    "name": "",
    "experience": "none",
    "goals": [],
    "horizon_years": 10,
    "risk_tolerance": "medium",
    "has_portfolio": False,
    "accounts": [],
}

EXPERIENCE_LEVEL = {"none": 1, "beginner": 1, "intermediate": 2, "advanced": 3}

GOAL_REASONS = {
    "retirement": "you're investing for retirement",
    "house": "you're saving for a home",
    "emergency_fund": "you want a safety net",
    "grow_wealth": "you want to grow your wealth",
    "education": "you're saving for education",
    "income": "you want investment income",
}

ACCOUNT_TAGS = {"tfsa", "rrsp", "fhsa", "resp"}


def normalize_profile(profile):
    """Fill in defaults and clean up types so the rest of the code can trust the profile."""
    clean = deepcopy(DEFAULT_PROFILE)
    for key, value in (profile or {}).items():
        if key in clean and value is not None and value != "":
            clean[key] = value

    clean["experience"] = str(clean["experience"]).lower()
    if clean["experience"] not in EXPERIENCE_LEVEL:
        clean["experience"] = "none"

    clean["risk_tolerance"] = str(clean["risk_tolerance"]).lower()
    if clean["risk_tolerance"] not in ("low", "medium", "high"):
        clean["risk_tolerance"] = "medium"

    try:
        clean["horizon_years"] = max(0, int(clean["horizon_years"]))
    except (TypeError, ValueError):
        clean["horizon_years"] = DEFAULT_PROFILE["horizon_years"]

    if isinstance(clean["goals"], str):
        clean["goals"] = [clean["goals"]]
    clean["goals"] = [g.lower() for g in clean["goals"] if g]

    if isinstance(clean["accounts"], str):
        clean["accounts"] = [clean["accounts"]]
    clean["accounts"] = [a.lower() for a in clean["accounts"] if a]

    if isinstance(clean["has_portfolio"], str):
        clean["has_portfolio"] = clean["has_portfolio"].lower() in ("true", "yes", "1", "on")
    clean["has_portfolio"] = bool(clean["has_portfolio"])
    return clean


def profile_tags(profile):
    """Translate a normalized profile into the tags used in lessons.py."""
    tags = set(profile["goals"])
    tags.add("has_portfolio" if profile["has_portfolio"] else "no_portfolio")

    horizon = profile["horizon_years"]
    if horizon <= 3:
        tags.add("short_horizon")
    elif horizon >= 10:
        tags.add("long_horizon")

    tags.add(f"{profile['risk_tolerance']}_risk")

    level = EXPERIENCE_LEVEL[profile["experience"]]
    if level == 1:
        tags.add("beginner")
    if level == 3:
        tags.add("advanced")
    return tags


def investor_style(profile):
    """A simple label for the user's portfolio style, based on risk and time horizon."""
    score = {"low": 0, "medium": 1, "high": 2}[profile["risk_tolerance"]]
    if profile["horizon_years"] <= 3:
        score -= 1
    elif profile["horizon_years"] >= 15:
        score += 1

    if score <= 0:
        return {"label": "Conservative",
                "description": "You value stability. Protecting your money matters more than chasing growth."}
    if score == 1:
        return {"label": "Balanced",
                "description": "You want growth but with a cushion. A mix of stocks and bonds fits you."}
    if score == 2:
        return {"label": "Growth",
                "description": "You can ride out ups and downs for higher long-term returns."}
    return {"label": "Aggressive Growth",
            "description": "Long horizon, high tolerance: mostly stocks, focused on long-term growth."}


def _reasons_for(lesson, profile, tags):
    """Human-readable 'why this lesson is in your plan' messages."""
    reasons = []
    for goal in profile["goals"]:
        if goal in lesson["tags"] and goal in GOAL_REASONS:
            reasons.append(f"Because {GOAL_REASONS[goal]}")
    if "short_horizon" in lesson["tags"] and "short_horizon" in tags:
        reasons.append("Because you'll need your money soon")
    if "long_horizon" in lesson["tags"] and "long_horizon" in tags:
        reasons.append("Because you have time on your side")
    if "has_portfolio" in lesson["tags"] and profile["has_portfolio"]:
        reasons.append("Helps prepare for your portfolio analysis")
    if "no_portfolio" in lesson["tags"] and not profile["has_portfolio"]:
        reasons.append("Useful before you make your first investment")
    if "low_risk" in lesson["tags"] and profile["risk_tolerance"] == "low":
        reasons.append("Fits your lower risk tolerance")
    if "high_risk" in lesson["tags"] and profile["risk_tolerance"] == "high":
        reasons.append("Fits your higher risk tolerance")
    return reasons


def _priority(lesson, profile, tags, reasons):
    """
    core        = everyone at this level should read it
    recommended = matches the user's goals / situation
    optional    = too basic for them, too advanced for now, or not relevant
    """
    user_level = EXPERIENCE_LEVEL[profile["experience"]]
    lesson_tags = set(lesson["tags"])

    # Accounts the user doesn't have and has no matching goal for (e.g. RESP without "education").
    account_tags = lesson_tags & ACCOUNT_TAGS
    if account_tags and not (account_tags & set(profile["accounts"])) and not reasons \
            and "core" not in lesson_tags:
        return "optional"

    # Too advanced for now.
    if lesson["level"] > user_level + 1:
        return "optional"

    # Experienced users can skim beginner material unless it's directly relevant.
    if user_level >= 2 and lesson["level"] == 1 and not reasons:
        return "optional"

    if "core" in lesson_tags:
        return "core"
    if reasons or (lesson_tags & tags):
        return "recommended"
    if lesson["level"] <= user_level:
        return "recommended"
    return "optional"


def build_toc(profile=None):
    """Main entry point. See module docstring for input/output format."""
    profile = normalize_profile(profile)
    tags = profile_tags(profile)

    modules = []
    for module in MODULES:
        lessons = []
        for lesson in LESSONS:
            if lesson["module"] != module["id"]:
                continue
            reasons = _reasons_for(lesson, profile, tags)
            lessons.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "summary": lesson["summary"],
                "minutes": lesson["minutes"],
                "level": lesson["level"],
                "priority": _priority(lesson, profile, tags, reasons),
                "reasons": reasons,
            })
        modules.append({**module, "lessons": lessons})

    # Users with a portfolio see the analysis module before "next steps";
    # users without one see "next steps" first. Keep foundations -> basics order intact.
    if not profile["has_portfolio"]:
        ids = [m["id"] for m in modules]
        a, n = ids.index("analyze"), ids.index("next")
        modules[a], modules[n] = modules[n], modules[a]

    plan = [lsn for m in modules for lsn in m["lessons"] if lsn["priority"] != "optional"]
    start_here = plan[0]["id"] if plan else LESSONS[0]["id"]

    return {
        "profile": profile,
        "style": investor_style(profile),
        "modules": modules,
        "start_here": start_here,
        "plan": [lsn["id"] for lsn in plan],
        "total_minutes": sum(lsn["minutes"] for lsn in plan),
    }
