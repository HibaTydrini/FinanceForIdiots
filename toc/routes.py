"""
Flask blueprint for the Table of Contents.

Pages
  GET  /learn                  personalized table of contents
  GET  /learn?demo=<name>      preview with a sample profile (see SAMPLE_PROFILES)
  GET  /learn/<lesson_id>      a single lesson (detailed explanation + quiz + "ask AI")

JSON API (for teammates)
  POST /api/toc                body: profile JSON  ->  personalized TOC JSON
  GET  /api/lessons/<id>       full lesson content
  POST /api/explain            body: {lesson_id, question}  ->  {answer}

HOW THE QUESTIONNAIRE PLUGS IN
  After the user finishes the questionnaire, call `save_profile(profile_dict)` (or set
  session["profile"] yourself) and redirect to url_for("toc.index").
  Until then, the TOC uses a sample profile so it can be built and tested on its own.
"""

from flask import Blueprint, abort, jsonify, render_template, request, session

from .ai_hook import explain
from .lessons import LESSONS_BY_ID, MODULES_BY_ID
from .personalize import build_toc, normalize_profile

toc_bp = Blueprint("toc", __name__)

# Stand-ins for the questionnaire output, so the TOC can be previewed on its own.
SAMPLE_PROFILES = {
    "beginner": {"name": "Alex", "experience": "none", "goals": ["emergency_fund", "grow_wealth"],
                 "horizon_years": 8, "risk_tolerance": "medium", "has_portfolio": False},
    "homebuyer": {"name": "Sam", "experience": "beginner", "goals": ["house"],
                  "horizon_years": 3, "risk_tolerance": "low", "has_portfolio": False},
    "investor": {"name": "Jordan", "experience": "intermediate", "goals": ["retirement", "income"],
                 "horizon_years": 25, "risk_tolerance": "high", "has_portfolio": True,
                 "accounts": ["tfsa", "rrsp"]},
}


def save_profile(profile):
    session["profile"] = normalize_profile(profile)


def current_profile():
    """The questionnaire's profile if there is one, otherwise a sample profile."""
    demo = request.args.get("demo")
    if demo in SAMPLE_PROFILES:
        save_profile(SAMPLE_PROFILES[demo])
    return session.get("profile") or SAMPLE_PROFILES["beginner"]


# ------------------------------------------------------------------ pages

@toc_bp.route("/learn")
def index():
    return render_template("toc.html", toc=build_toc(current_profile()), samples=SAMPLE_PROFILES)


@toc_bp.route("/learn/<lesson_id>")
def lesson(lesson_id):
    data = LESSONS_BY_ID.get(lesson_id)
    if data is None:
        abort(404)
    toc = build_toc(current_profile())

    # Prev/next follow the user's personal plan; fall back to curriculum order for optional lessons.
    order = toc["plan"] if lesson_id in toc["plan"] else \
        [lsn["id"] for m in toc["modules"] for lsn in m["lessons"]]
    i = order.index(lesson_id)
    prev_id = order[i - 1] if i > 0 else None
    next_id = order[i + 1] if i + 1 < len(order) else None

    entry = next(lsn for m in toc["modules"] for lsn in m["lessons"] if lsn["id"] == lesson_id)
    return render_template(
        "lesson.html",
        lesson=data,
        entry=entry,
        module=MODULES_BY_ID[data["module"]],
        prev=LESSONS_BY_ID.get(prev_id),
        next=LESSONS_BY_ID.get(next_id),
        plan=toc["plan"],
    )


# ------------------------------------------------------------------ API

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


@toc_bp.route("/api/explain", methods=["POST"])
def api_explain():
    body = request.get_json(silent=True) or {}
    data = LESSONS_BY_ID.get(body.get("lesson_id"))
    question = (body.get("question") or "").strip()
    if data is None or not question:
        return jsonify({"error": "lesson_id and question are required"}), 400
    answer = explain(data, question, normalize_profile(current_profile()))
    return jsonify({"answer": answer})
