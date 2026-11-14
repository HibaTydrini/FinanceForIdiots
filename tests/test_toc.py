import pytest

from app import create_app
from toc.lessons import LESSONS, MODULES_BY_ID
from toc.personalize import build_toc, normalize_profile


def priority(toc, lesson_id):
    return next(l["priority"] for m in toc["modules"] for l in m["lessons"] if l["id"] == lesson_id)


def test_lessons_are_well_formed():
    ids = [l["id"] for l in LESSONS]
    assert len(ids) == len(set(ids)), "duplicate lesson ids"
    for l in LESSONS:
        assert l["module"] in MODULES_BY_ID
        assert l["body"] and l["key_points"] and l["example"]


def test_requested_topics_are_covered():
    ids = {l["id"] for l in LESSONS}
    for topic in ["stocks", "etfs", "mutual-funds", "what-is-crypto", "bitcoin",
                  "tfsa", "rrsp", "fhsa", "what-is-investing", "investment-taxes"]:
        assert topic in ids


def test_empty_profile_still_builds():
    toc = build_toc({})
    assert toc["plan"] and toc["start_here"] == toc["plan"][0]


def test_bad_values_are_normalized():
    p = normalize_profile({"experience": "guru", "horizon_years": "abc", "risk_tolerance": "YOLO",
                           "goals": "house", "interests": "Crypto", "has_portfolio": "yes"})
    assert p["experience"] == "none"
    assert p["horizon_years"] == 10
    assert p["risk_tolerance"] == "medium"
    assert p["goals"] == ["house"]
    assert p["interests"] == ["crypto"]
    assert p["has_portfolio"] is True


def test_crypto_only_for_people_who_want_it():
    plain = build_toc({"experience": "beginner", "risk_tolerance": "medium"})
    assert priority(plain, "bitcoin") == "optional"

    curious = build_toc({"experience": "beginner", "interests": ["crypto"]})
    assert priority(curious, "what-is-crypto") == "recommended"
    assert priority(curious, "bitcoin") == "recommended"


def test_homebuyer_gets_fhsa_and_gics():
    toc = build_toc({"experience": "beginner", "goals": ["house"], "horizon_years": 3,
                     "risk_tolerance": "low"})
    assert priority(toc, "fhsa") == "recommended"
    assert priority(toc, "bonds-and-gics") == "recommended"
    assert priority(toc, "rrsp") == "optional"


def test_experts_skip_basics():
    toc = build_toc({"experience": "advanced", "goals": ["retirement"]})
    assert priority(toc, "what-is-investing") == "optional"
    assert priority(toc, "rrsp") == "recommended"


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()


def test_pages_render(client):
    assert client.get("/learn").status_code == 200
    for demo in ["beginner", "homebuyer", "crypto"]:
        assert client.get(f"/learn?demo={demo}").status_code == 200
    for l in LESSONS:
        assert client.get(f"/learn/{l['id']}").status_code == 200, l["id"]
    assert client.get("/learn/not-a-lesson").status_code == 404


def test_api(client):
    res = client.post("/api/toc", json={"interests": ["bitcoin"]})
    assert "bitcoin" in res.get_json()["plan"]
    assert client.get("/api/lessons/tfsa").get_json()["title"].startswith("TFSA")
