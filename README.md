# Finance For Dummies

An agentic AI financial coach for beginner investors, built for the PolyFinances Datathon 2026 (National Bank of Canada × AWS case). It explains investing in plain language using National Bank content, adapts to each user's profile, and follows up every week to help them take their next step.

**Live website:** https://main.dr25ndssa271w.amplifyapp.com/

## What it does

- **AI Coach**: answers investing questions using National Bank content (RAG on Amazon Bedrock), personalized with the user's onboarding profile, with sources.
- **Learning path**: short illustrated lessons, from budgeting basics to portfolios.
- **My Plan (Baby Steps)**: a step-by-step plan with progress tracking.
- **Demo portfolio**: sample holdings with charts and plain-language highlights.
- **Weekly email check-ins**: the coach emails each user about their next step, and they can reply in one click.
- **Google Calendar agent**: the coach finds free time and books the next step in the user's calendar.
- **Market news and activity feed**: recent headlines, plus a log of everything the coach did and why.

## Trying the demo

We aren't allowed to use real client data yet, so the site comes with premade demo clients. After you sign in, pick one of these preregistered users on the **Choose Demo Account** screen. You can test every feature with these premade accounts, except the weekly emails and Google Calendar.

The reminder emails and the Google Calendar tasks both work, but only for registered accounts for now, because the website isn't fully deployed yet.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript, hosted on **AWS Amplify** |
| Authentication | **Amazon Cognito** |
| Backend API | Python **FastAPI** with boto3 |
| AI | **Amazon Bedrock** (Knowledge Bases for retrieval, Converse API with tool use) |
| Email | **Amazon SES** |
| Scheduling | **Amazon EventBridge** (weekly check-in) |
| External | Finnhub (news), Google Calendar API |

## Project layout

- `Frontend/`: the web app
- `backend/`: the API ([setup and endpoints](backend/README.md))
- `knowledge/`: company fact sheets for the knowledge base
- `docs/`: project documentation

## Run locally

```bash
# Backend (needs AWS credentials, KB_ID and MODEL_ID; see backend/README.md)
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Frontend
cd Frontend
npm install
npm run dev
```

The frontend calls `http://localhost:8000` by default. To use another backend, set `VITE_API_URL` in `Frontend/.env`.
