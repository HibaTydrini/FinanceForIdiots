"""
PolyFinances Datathon 2026 - Chatbot backend (Step 2: personalize with the profile)

Endpoints
  POST /profile        save the onboarding answers for a user
  GET  /profile/{id}   read them back
  POST /chat           answer a question using the NBC knowledge base + the user's profile

Run locally
  pip install -r requirements.txt
  export AWS_REGION=us-east-1
  export KB_ID=<your knowledge base ID>
  export MODEL_ID=<model ID copied from Bedrock > Model catalog>
  uvicorn app:app --reload --port 8000
"""

import json
import os
from pathlib import Path

import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

REGION = os.environ.get("AWS_REGION", "us-east-1")
KB_ID = os.environ["KB_ID"]
MODEL_ID = os.environ["MODEL_ID"]
PROFILE_FILE = Path(os.environ.get("PROFILE_FILE", "profiles.json"))
NUM_RESULTS = 5          # how many NBC passages to give the model
MAX_HISTORY = 10         # how many previous chat messages to keep

kb_client = boto3.client("bedrock-agent-runtime", region_name=REGION)
llm_client = boto3.client("bedrock-runtime", region_name=REGION)

app = FastAPI()
app.add_middleware(  # lets your frontend (different port/domain) call this API
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


# ---------- Profile storage (a JSON file is enough for a datathon; swap for DynamoDB later) ----------

class Profile(BaseModel):
    """The onboarding quiz answers (Frontend/src/App.tsx, `questions`)."""
    user_id: str
    knowledge: str = ""          # What is your investment knowledge?
    invested_in: str = ""        # What have you invested in?
    goals: str = ""              # Why do you want to invest? What are your specific goals?
    risk_tolerance: str = ""     # What is your risk tolerance?
    looking_for: str = ""        # What are you looking for from Finance for idiots?


def load_profiles() -> dict:
    if PROFILE_FILE.exists():
        return json.loads(PROFILE_FILE.read_text(encoding="utf-8"))
    return {}


def save_profiles(profiles: dict) -> None:
    PROFILE_FILE.write_text(json.dumps(profiles, indent=2, ensure_ascii=False), encoding="utf-8")


@app.post("/profile")
def save_profile(profile: Profile):
    profiles = load_profiles()
    profiles[profile.user_id] = profile.model_dump()
    save_profiles(profiles)
    return {"ok": True}


@app.get("/profile/{user_id}")
def get_profile(user_id: str):
    profile = load_profiles().get(user_id)
    if profile is None:
        raise HTTPException(404, "Profile not found")
    return profile


# ---------- Chat ----------

class Message(BaseModel):
    role: str      # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    user_id: str
    question: str
    history: list[Message] = []   # previous messages, sent by the frontend
    portfolio: dict | None = None  # demo client picked on the Portfolio page (fictional data)
    # What the user is looking at, sent by the AI Phone:
    # {"page": "My Learning Path", "lesson": {"topic": "ETFs", "slide": "Example", "content": "..."}}
    context: dict | None = None


def search_nbc(question: str) -> list[dict]:
    """Step 2a: find the most relevant NBC passages in the knowledge base."""
    # No retrievalConfiguration: this is a managed knowledge base, which rejects
    # vectorSearchConfiguration. Use its default search and keep the top results here.
    resp = kb_client.retrieve(
        knowledgeBaseId=KB_ID,
        retrievalQuery={"text": question},
    )
    # Several passages often come from the same page: merge them so each page is one numbered source.
    by_url: dict[str, list[str]] = {}
    for r in resp.get("retrievalResults", [])[:NUM_RESULTS]:
        text = (r.get("content") or {}).get("text")
        if not text:
            continue
        loc = r.get("location", {})
        url = (loc.get("webLocation") or {}).get("url") or (loc.get("s3Location") or {}).get("uri", "")
        by_url.setdefault(url, []).append(text)
    return [{"url": url, "text": "\n...\n".join(texts)} for url, texts in by_url.items()]


def current_lesson(context: dict | None) -> dict:
    """The lesson open on screen, or {} if none."""
    return (context or {}).get("lesson") or {}


def build_system_prompt(
    profile: dict, passages: list[dict], portfolio: dict | None = None, context: dict | None = None
) -> str:
    """Step 2b: put the user's profile and the NBC passages into the instructions."""
    sources = "\n\n".join(
        f"[Source {i + 1}] {p['url']}\n{p['text']}" for i, p in enumerate(passages)
    ) or "(no relevant NBC sources were found)"

    screen_section = ""
    if context and context.get("page"):
        lesson = current_lesson(context)
        screen_section = f"""
ON SCREEN
The user is on the "{context['page']}" page of the Finance for idiots website."""
        if lesson:
            screen_section += f"""
They are reading the lesson "{lesson.get('topic', '')}", slide "{lesson.get('slide', '')}", which says:
\"\"\"{str(lesson.get('content', ''))[:2000]}\"\"\"
When they say "this", "that" or "explain this", they mean this lesson and slide. The slide is the
website's own teaching text, not an NBC source: use it to understand the question, but cite only
the NBC sources below for facts."""
        screen_section += "\n"

    portfolio_section = ""
    if portfolio:
        portfolio_section = f"""
DEMO PORTFOLIO
The user is exploring this fictional demo client's portfolio (a simulation, not a real account).
You may describe it and explain it with its numbers (concentration, diversification, risk, past
returns), and relate it to the NBC sources. Still never tell them to buy or sell anything.
{json.dumps(portfolio, ensure_ascii=False)}
"""

    return f"""You are a friendly investing tutor for National Bank of Canada (NBC) clients who are new to investing.

USER PROFILE
- Investing knowledge: {profile.get('knowledge') or 'unknown (assume a beginner)'}
- Has invested in: {profile.get('invested_in') or 'unknown'}
- Goals: {profile.get('goals') or 'unknown'}
- Risk tolerance: {profile.get('risk_tolerance') or 'unknown'}
- Wants help with: {profile.get('looking_for') or 'unknown'}
{portfolio_section}{screen_section}
HOW TO ANSWER
- Explain at this user's level. For beginners, define every term and use simple, everyday examples.
- Relate explanations to the user's goals and risk tolerance when it helps.
- Keep answers short: a few short paragraphs. Write plain text; simple "- " bullet lists are fine, but no headings, bold or tables.
- Use ONLY the NBC sources below for facts. Cite them as [Source N].
- If the sources don't cover the question, say so and suggest what NBC topic they could read about or ask an NBC advisor.
- This is education, not personal financial advice: never tell the user to buy or sell a specific investment.
- Reply in the same language the user writes in (English or French).

NBC SOURCES
{sources}"""


@app.post("/chat")
def chat(req: ChatRequest):
    profile = load_profiles().get(req.user_id, {})
    # "Explain this" alone would find nothing useful, so search for the open lesson's topic too.
    topic = current_lesson(req.context).get("topic")
    passages = search_nbc(f"{topic}: {req.question}" if topic else req.question)

    # Conversation = recent history + the new question
    messages = [
        {"role": m.role, "content": [{"text": m.text}]}
        for m in req.history[-MAX_HISTORY:]
    ]
    messages.append({"role": "user", "content": [{"text": req.question}]})

    resp = llm_client.converse(
        modelId=MODEL_ID,
        system=[{"text": build_system_prompt(profile, passages, req.portfolio, req.context)}],
        messages=messages,
        # No temperature: some newer Claude models reject sampling parameters.
        inferenceConfig={"maxTokens": 1500},
    )
    # Models with built-in thinking return a reasoning block before the text,
    # so take the text blocks instead of assuming the first block is the answer.
    answer = "".join(
        block["text"] for block in resp["output"]["message"]["content"] if "text" in block
    )

    return {
        "answer": answer,
        "sources": [{"n": i + 1, "url": p["url"]} for i, p in enumerate(passages)],
    }
