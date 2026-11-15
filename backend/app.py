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
    user_id: str
    knowledge: str = ""          # i)   What knowledge do you have about investment
    invested_in: str = ""        # ii)  What have you invested in already
    goals: str = ""              # iii) Why do you need to invest
    age_range: str = ""          # iv)  Age range
    looking_for: str = ""        # v)   What are you looking for from us
    nbc_linked: bool = False     # vi)  Linked NBC account (mocked for the demo)


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


def search_nbc(question: str) -> list[dict]:
    """Step 2a: find the most relevant NBC passages in the knowledge base."""
    # No retrievalConfiguration: this is a managed knowledge base, which rejects
    # vectorSearchConfiguration. Use its default search and keep the top results here.
    resp = kb_client.retrieve(
        knowledgeBaseId=KB_ID,
        retrievalQuery={"text": question},
    )
    passages = []
    for r in resp.get("retrievalResults", [])[:NUM_RESULTS]:
        text = (r.get("content") or {}).get("text")
        if not text:
            continue
        loc = r.get("location", {})
        url = (loc.get("webLocation") or {}).get("url") or (loc.get("s3Location") or {}).get("uri", "")
        passages.append({"text": text, "url": url})
    return passages


def build_system_prompt(profile: dict, passages: list[dict]) -> str:
    """Step 2b: put the user's profile and the NBC passages into the instructions."""
    sources = "\n\n".join(
        f"[Source {i + 1}] {p['url']}\n{p['text']}" for i, p in enumerate(passages)
    ) or "(no relevant NBC sources were found)"

    return f"""You are a friendly investing tutor for National Bank of Canada (NBC) clients who are new to investing.

USER PROFILE
- Investing knowledge: {profile.get('knowledge') or 'unknown'}
- Already invested in: {profile.get('invested_in') or 'nothing yet'}
- Goals: {profile.get('goals') or 'unknown'}
- Age range: {profile.get('age_range') or 'unknown'}
- Looking for: {profile.get('looking_for') or 'unknown'}

HOW TO ANSWER
- Explain at this user's level. For beginners, define every term and use simple, everyday examples.
- Relate explanations to the user's goals and age range when it helps.
- Use ONLY the NBC sources below for facts. Cite them as [Source N].
- If the sources don't cover the question, say so and suggest what NBC topic they could read about or ask an NBC advisor.
- This is education, not personal financial advice: never tell the user to buy or sell a specific investment.
- Reply in the same language the user writes in (English or French).

NBC SOURCES
{sources}"""


@app.post("/chat")
def chat(req: ChatRequest):
    profile = load_profiles().get(req.user_id, {})
    passages = search_nbc(req.question)

    # Conversation = recent history + the new question
    messages = [
        {"role": m.role, "content": [{"text": m.text}]}
        for m in req.history[-MAX_HISTORY:]
    ]
    messages.append({"role": "user", "content": [{"text": req.question}]})

    resp = llm_client.converse(
        modelId=MODEL_ID,
        system=[{"text": build_system_prompt(profile, passages)}],
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
