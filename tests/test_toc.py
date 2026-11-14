import pytest

from app import create_app
from toc.lessons import LESSONS, MODULES_BY_ID
from toc.personalize import build_toc, normalize_profile


def priority(toc, lesson_id):
    return next(l["priority"] for m in toc["modules"] for l in m["lessons"] if l["id"] == lesson_id)


# ------------------------------------------------------------------ content

def test_lessons_are_well_formed():
    ids = [l["id"] for l in LESSONS]
    assert len(ids) == len(set(ids)), "duplicate lesson ids"
    for l in LESSONS:
        assert l["module"] in MODULES_BY_ID
        assert 0 <= l["quiz"]["answer"] < len(l["quiz"]["options"])
        assert l["body"] and l["key_points"] and l["example"]


# ------------------------------------------------------------------ personalization

def test_empty_profile_still_builds():
    toc = build_toc({})
    assert toc["plan"] and toc["start_here"] == toc["plan"][0]
    assert toc["style"]["label"]


def test_bad_values_are_normalized():
    p = normalize_profile({"experience": "guru", "horizon_years": "abc",
                           "risk_tolerance": "YOLO", "goals": "house", "has_portfolio": "yes"})
    assert p["experience"] == "none"
    assert p["horizon_years"] == 10
    assert p["risk_tolerance"] == "medium"
    assert p["goals"] == ["house"]
    assert p["has_portfolio"] is True


def test_homebuyer_gets_fhsa_and_gics():
    toc = build_toc({"experience": "beginner", "goals": ["house"], "horizon_years": 3,
                     "risk_tolerance": "low"})
    assert priority(toc, "fhsa") == "recommended"
    assert priority(toc, "gics") == "recommended"
    assert priority(toc, "resp") == "optional"
    assert toc["style"]["label"] == "Conservative"


def test_beginner_skips_advanced_lessons():
    toc = build_toc({"experience": "none"})
    assert priority(toc, "performance-and-benchmarks") == "optional"
    assert priority(toc, "investment-taxes") == "optional"


def test_experienced_investor_skips_basics_but_sees_analysis():
    toc = build_toc({"experience": "advanced", "has_portfolio": True, "goals": ["retirement"],
                     "horizon_years": 25, "risk_tolerance": "high", "accounts": ["tfsa", "rrsp"]})
    assert priority(toc, "debt-vs-investing") == "optional"
    assert priority(toc, "reading-your-statement") == "recommended"
    assert priority(toc, "performance-and-benchmarks") == "recommended"
    assert priority(toc, "resp") == "optional"  # no education goal, no RESP
    assert toc["style"]["label"] == "Aggressive Growth"


def test_module_order_depends_on_portfolio():
    order = lambda toc: [m["id"] for m in toc["modules"]]
    with_p = order(build_toc({"has_portfolio": True}))
    without = order(build_toc({"has_portfolio": False}))
    assert with_p.index("analyze") < with_p.index("next")
    assert without.index("next") < without.index("analyze")


# ------------------------------------------------------------------ web

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()


def test_pages_render(client):
    assert client.get("/learn").status_code == 200
    assert client.get("/learn?demo=investor").status_code == 200
    for l in LESSONS:
        assert client.get(f"/learn/{l['id']}").status_code == 200, l["id"]
    assert client.get("/learn/not-a-lesson").status_code == 404


def test_api(client):
    res = client.post("/api/toc", json={"goals": ["education"], "experience": "beginner"})
    assert res.status_code == 200
    assert "resp" in res.get_json()["plan"]

    assert client.get("/api/lessons/tfsa").get_json()["title"].startswith("TFSA")
    assert client.post("/api/explain", json={"lesson_id": "tfsa", "question": "why?"}).status_code == 200
    assert client.post("/api/explain", json={"lesson_id": "tfsa"}).status_code == 400
