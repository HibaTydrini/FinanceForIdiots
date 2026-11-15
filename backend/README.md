# Chatbot backend

FastAPI service that answers investing questions using the NBC content in an Amazon Bedrock Knowledge Base, personalized with the user's onboarding profile.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| POST | `/profile` | Save a user's onboarding answers |
| GET | `/profile/{user_id}` | Read them back |
| POST | `/chat` | Answer `{ user_id, question, history }` using the NBC knowledge base and the profile; returns `{ answer, sources }` |

Profiles are stored in `profiles.json` (ignored by git). Swap for DynamoDB later.

## Run locally

1. Get your AWS credentials (event sign-in page → "Get AWS CLI credentials") and paste the `export AWS_...` lines into your terminal.
2. From this `backend/` folder:

```bash
pip install -r requirements.txt
export AWS_REGION=us-east-1
export KB_ID=<knowledge base ID>
export MODEL_ID=<model ID from Bedrock > Model catalog>
uvicorn app:app --reload --port 8000
```

On Windows PowerShell use `$env:KB_ID="..."` instead of `export`. Some models need an inference profile ID starting with `us.`.

3. Open http://localhost:8000/docs to try `/profile` then `/chat` in the browser.
