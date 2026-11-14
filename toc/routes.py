"""
Flask blueprint for the Table of Contents.

Pages
  GET  /learn                  table of contents: every topic, expandable, with sources
  GET  /learn?level=expert     same, opened at another reading level
  GET  /learn/plan             personalized plan (for later, when sorting is added)
  GET  /learn/<lesson_id>      a single lesson, explained in detail

JSON API
  GET  /api/topics?level=...   the table of contents as JSON
  POST /api/toc                body: profile JSON  ->  personalized TOC JSON
  GET  /api/lessons/<id>       full lesson content

HOW THE OPENING QUIZ PLUGS IN
  When the user finishes the quiz, call `save_profile(answers)` and redirect to
  url_for("toc.index"). Until then, the TOC uses a sample profile.
"""

from flask import Blueprint, abort, jsonify, render_template, request, session

from .lessons import LESSONS_BY_ID, MODULES_BY_ID
from .personalize import build_toc, normalize_profile
from .topics import LEVELS, build_contents

toc_bp = Blueprint("toc", __name__)

# Stand-ins for the opening quiz, so the TOC can be previewed on its own.
SAMPLE_PROFILES = {
    "beginner": {"name": "Alex", "experience": "none", "goals": ["grow_wealth"],
                 "interests": ["stocks", "etfs"], "horizon_years": 8,
                 "risk_tolerance": "medium", "has_portfolio": False},
    "homebuyer": {"name": "Sam", "experience": "beginner", "goals": ["house"],
                  "interests": ["fhsa", "tfsa"], "horizon_years": 3,
                  "risk_tolerance": "low", "has_portfolio": False},
    "crypto": {"name": "Jordan", "experience": "intermediate", "goals": ["grow_wealth"],
               "interests": ["crypto", "bitcoin"], "horizon_years": 15,
               "risk_tolerance": "high", "has_portfolio": True, "accounts": ["tfsa"]},
}


def save_profile(profile):
    session["profile"] = normalize_profile(profile)


def current_profile():
    """The quiz answers if there are any, otherwise a sample profile."""
    demo = request.args.get("demo")
    if demo in SAMPLE_PROFILES:
        save_profile(SAMPLE_PROFILES[demo])
    return session.get("profile") or SAMPLE_PROFILES["beginner"]


@toc_bp.route("/learn")
def index():
    """The table of contents. The level can come from the quiz later (session["level"])."""
    level = request.args.get("level") or session.get("level", "novice")
    return render_template(
        "contents.html",
        contents=build_contents(level),
        levels=LEVELS,
        lesson_titles={lid: data["title"] for lid, data in LESSONS_BY_ID.items()},
    )


@toc_bp.route("/learn/plan")
def plan():
    """Personalized plan, kept for later (sorting topics per user)."""
    return render_template("toc.html", toc=build_toc(current_profile()), samples=SAMPLE_PROFILES)


@toc_bp.route("/api/topics")
def api_topics():
    return jsonify(build_contents(request.args.get("level", "novice")))


@toc_bp.route("/learn/<lesson_id>")
def lesson(lesson_id):
    data = LESSONS_BY_ID.get(lesson_id)
    if data is None:
        abort(404)
    toc = build_toc(current_profile())

    # Prev/next follow the user's plan; optional lessons fall back to full curriculum order.
    order = toc["plan"] if lesson_id in toc["plan"] else \
        [lsn["id"] for m in toc["modules"] for lsn in m["lessons"]]
    i = order.index(lesson_id)
    entry = next(lsn for m in toc["modules"] for lsn in m["lessons"] if lsn["id"] == lesson_id)
    return render_template(
        "lesson.html",
        lesson=data,
        entry=entry,
        module=MODULES_BY_ID[data["module"]],
        prev=LESSONS_BY_ID.get(order[i - 1]) if i > 0 else None,
        next=LESSONS_BY_ID.get(order[i + 1]) if i + 1 < len(order) else None,
    )


@toc_bp.route("/api/toc", methods=["GET", "POST"])
def api_toc():
    profile = request.get_json(silent=True) if request.method == "POST" else current_profile()
    return jsonify(build_toc(profile))


@toc_bp.route("/api/lessons/<lesson_id>")
def api_lesson(lesson_id):
    data = LESSONS_BY_ID.get(lesson_id)
    if data is None:
        return jsonify({"error": "lesson not found"}), 404
    return jsonify(data)
