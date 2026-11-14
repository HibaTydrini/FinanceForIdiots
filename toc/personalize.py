"""
Turns the user's answers from the opening quiz into a personalized Table of Contents.

PROFILE (what the opening quiz should produce; every field is optional)
-----------------------------------------------------------------------
{
    "name": "Cindy",
    "experience": "none" | "beginner" | "intermediate" | "advanced",
    "goals": ["retirement", "house", "grow_wealth", "income", "short_term"],
    "interests": ["stocks", "etfs", "mutual_funds", "crypto", "bitcoin",
                  "tfsa", "rrsp", "fhsa", "taxes"],
    "horizon_years": 10,                     # when they'll need the money
    "risk_tolerance": "low" | "medium" | "high",
    "has_portfolio": True | False,
    "accounts": ["tfsa", "rrsp", "fhsa"],    # accounts they already have
}

OUTPUT of build_toc(profile)
----------------------------
{
    "profile": {...cleaned profile...},
    "modules": [{"id", "title", "description",
                 "lessons": [{"id", "title", "summary", "minutes", "level",
                              "priority": "core" | "recommended" | "optional",
                              "reasons": ["Because you're saving for a home", ...]}]}],
    "plan": ["lesson-id", ...],      # core + recommended lessons, in reading order
    "start_here": "lesson-id",
    "total_minutes": 42,
}
"""

from copy import deepcopy

from .lessons import LESSONS, MODULES

DEFAULT_PROFILE = {
    "name": "",
    "experience": "none",
    "goals": [],
    "interests": [],
    "horizon_years": 10,
    "risk_tolerance": "medium",
    "has_portfolio": False,
    "accounts": [],
}

EXPERIENCE_LEVEL = {"none": 1, "beginner": 1, "intermediate": 2, "advanced": 3}

GOAL_REASONS = {
    "retirement": "you're investing for retirement",
    "house": "you're saving for a home",
    "grow_wealth": "you want to grow your wealth",
    "income": "you want investment income",
    "short_term": "you're saving for something soon",
}

INTEREST_LABELS = {
    "stocks": "stocks", "etfs": "ETFs", "mutual_funds": "mutual funds",
    "crypto": "crypto", "bitcoin": "Bitcoin", "tfsa": "the TFSA",
    "rrsp": "the RRSP", "fhsa": "the FHSA", "taxes": "taxes",
}

ACCOUNTS = {"tfsa", "rrsp", "fhsa"}


def _as_list(value):
    if isinstance(value, str):
        value = [value]
    return [str(v).lower() for v in (value or []) if v]


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

    for key in ("goals", "interests", "accounts"):
        clean[key] = _as_list(clean[key])

    if isinstance(clean["has_portfolio"], str):
        clean["has_portfolio"] = clean["has_portfolio"].lower() in ("true", "yes", "1", "on")
    clean["has_portfolio"] = bool(clean["has_portfolio"])
    return clean


def _reasons_for(lesson, profile):
    """Human-readable 'why this lesson is in your plan' messages."""
    tags = set(lesson["tags"])
    reasons = []
    for interest in profile["interests"]:
        if interest in tags and interest in INTEREST_LABELS:
            reasons.append(f"You said you're curious about {INTEREST_LABELS[interest]}")
    for goal in profile["goals"]:
        if goal in tags and goal in GOAL_REASONS:
            reasons.append(f"Because {GOAL_REASONS[goal]}")
    owned = tags & ACCOUNTS & set(profile["accounts"])
    if owned:
        reasons.append(f"You already have a {sorted(owned)[0].upper()}")
    if "short_horizon" in tags and profile["horizon_years"] <= 3:
        reasons.append("Because you'll need your money soon")
    if "long_horizon" in tags and profile["horizon_years"] >= 10:
        reasons.append("Because you have time on your side")
    if "low_risk" in tags and profile["risk_tolerance"] == "low":
        reasons.append("Fits your lower risk tolerance")
    if "high_risk" in tags and profile["risk_tolerance"] == "high":
        reasons.append("Fits your higher risk tolerance")
    if "has_portfolio" in tags and profile["has_portfolio"]:
        reasons.append("Useful for the investments you already have")
    return list(dict.fromkeys(reasons))  # drop duplicates, keep order


def _priority(lesson, profile, reasons):
    """
    core        = everyone at this level should read it
    recommended = matches the user's answers
    optional    = not relevant to them, too basic, or too advanced for now
    """
    user_level = EXPERIENCE_LEVEL[profile["experience"]]
    is_core = "core" in lesson["tags"]

    if lesson["level"] > user_level + 1:
        return "optional"                       # too advanced for now
    if user_level == 3 and lesson["level"] == 1 and not reasons:
        return "optional"                       # experts can skip the basics
    if is_core:
        return "core"
    if reasons:
        return "recommended"
    return "optional"


def build_toc(profile=None):
    """Main entry point. See module docstring for input/output format."""
    profile = normalize_profile(profile)

    modules = []
    for module in MODULES:
        lessons = []
        for lesson in LESSONS:
            if lesson["module"] != module["id"]:
                continue
            reasons = _reasons_for(lesson, profile)
            lessons.append({
                "id": lesson["id"],
                "title": lesson["title"],
                "summary": lesson["summary"],
                "minutes": lesson["minutes"],
                "level": lesson["level"],
                "priority": _priority(lesson, profile, reasons),
                "reasons": reasons,
            })
        modules.append({**module, "lessons": lessons})

    plan = [lsn for m in modules for lsn in m["lessons"] if lsn["priority"] != "optional"]
    return {
        "profile": profile,
        "modules": modules,
        "plan": [lsn["id"] for lsn in plan],
        "start_here": plan[0]["id"] if plan else LESSONS[0]["id"],
        "total_minutes": sum(lsn["minutes"] for lsn in plan),
    }
