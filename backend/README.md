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

## Weekly email check-ins

The My Plan page has a "Weekly email check-ins" box (email address + consent, prefilled with the sign-in email). Once a week the backend:

1. picks everyone who opted in and hasn't had an email in 6 days,
2. asks **Bedrock** for 2-3 personal sentences about their next Baby Step (with a fixed fallback if Bedrock fails),
3. sends the email with **Amazon SES**, with three one-click buttons: **I did it** (ticks that action on the website), **Not yet**, **I need help** (opens the AI Coach), plus a "turn off check-ins" link.

**Amazon EventBridge** triggers the weekly run by calling `POST /checkins/run`. The buttons' links are signed with `CHECKIN_SECRET`, so nobody can answer or unsubscribe for someone else.

| Method | Path | What it does |
|---|---|---|
| PUT | `/progress/{user_id}` | Save Baby Steps progress, the plan and the email opt-in (the website does this on every change) |
| GET | `/progress/{user_id}` | Read it back, including actions ticked from an email |
| POST | `/checkins/send/{user_id}` | Send this user's check-in now (the "Send a check-in now" button) |
| POST | `/checkins/run` | Send every check-in that is due. Needs the `X-Checkin-Secret` header |
| GET | `/checkins/answer` | Where the email buttons lead: saves the answer, shows a small thank-you page |

Progress and the check-in history are stored in `progress.json` (ignored by git).

### 1. Amazon SES

1. Open the **SES console in the same region as `AWS_REGION`** > Identities > Create identity > Email address. Verify the sender address (click the link SES emails you).
2. New SES accounts are in the **sandbox**: they can only send *to* verified addresses too. Verify every address you'll demo with the same way (or request production access, which takes about a day).

### 2. Environment variables

Same terminal as `uvicorn` (or `start.ps1`); use `$env:NAME="..."` on PowerShell:

```bash
export SES_FROM=<the verified sender address>
export CHECKIN_SECRET=<any long random string>
export PUBLIC_API_URL=<this backend's public https address, used in the email links>
export FRONTEND_URL=http://localhost:5173        # where "Open my plan" / "Ask the AI Coach" lead
```

The AWS credentials need `ses:SendEmail` on top of the Bedrock permissions. Run `cloudflared tunnel --url http://localhost:8000` (or `ngrok http 8000`) to get a public address for `PUBLIC_API_URL`. For a quick test on the same computer, `http://localhost:8000` works too.

**Try it:** on My Plan, enter a verified address, tick the box, Save, then "Send a check-in now". Click "I did it" in the email: the action is ticked on the website within a few seconds.

### 3. The weekly schedule (Amazon EventBridge)

EventBridge needs the public address from step 2. In the **EventBridge console**:

1. **API destinations** > Connections > Create connection. Authorization type: **API Key**. Name: `X-Checkin-Secret`, value: your `CHECKIN_SECRET`.
2. **API destinations** > Create API destination. Endpoint: `https://<your-address>/checkins/run`, method **POST**, connection from step 1.
3. **Rules** > Create rule > **Schedule** (or EventBridge Scheduler > Create schedule). Cron: `0 22 ? * SUN *` (Sundays 22:00 UTC, 6 pm in Montreal in summer). Target: **EventBridge API destination**, the one from step 2. Let it create the execution role.

Running it more often is harmless: `/checkins/run` skips anyone emailed in the last 6 days. To trigger it by hand:

```bash
curl -X POST https://<your-address>/checkins/run -H "X-Checkin-Secret: <your CHECKIN_SECRET>"
```

A quick tunnel's address changes every time it restarts: update the API destination's endpoint and `PUBLIC_API_URL` when it does.

## Google Calendar agent

When a user connects Google Calendar (My Plan > "Your AI coach books it in Google Calendar"), the Bedrock model becomes an agent with four tools: `get_plan`, `list_planned_tasks`, `find_busy_times` and `add_task`. It acts in two places:

- **The weekly check-in, on its own:** before the email is written, it books one time slot for the user's next Baby Steps action (if one isn't booked already), and the email says when.
- **The AI Coach chat, when asked:** "plan my week", "remind me to open my TFSA on Saturday morning"... It checks when they're busy, books up to 3 tasks and says what it booked.

It writes only to its own "Finance for idiots" calendar (scope `calendar.app.created`) and only sees *when* the user is busy (scope `calendar.freebusy`), never their event details. Tasks must be in the next 14 days, between 07:00 and 21:30. The Google tokens are stored in `progress.json` (ignored by git) and never sent to the browser.

### Setup (Google Cloud, about 15 minutes)

1. https://console.cloud.google.com > project picker > **New project** (e.g. `finance-for-idiots`) > Create, and select it.
2. **APIs & Services > Library**: search **Google Calendar API** > **Enable**.
3. **Google Auth Platform** (or **APIs & Services > OAuth consent screen**) > Get started. App name `Finance for idiots`, your email as support and contact email, Audience **External**. Create.
4. **Data access** > Add or remove scopes > paste both, one at a time, in "Manually add scopes", then Update and Save:
   `https://www.googleapis.com/auth/calendar.app.created` and `https://www.googleapis.com/auth/calendar.freebusy`
5. **Audience** > Test users > **Add users**: every Google account you'll demo with (up to 100). Leave the app in **Testing**.
6. **Clients** (or **Credentials > Create credentials > OAuth client ID**): type **Web application**. Under **Authorized redirect URIs** add exactly `http://localhost:8000/google/callback`. Create, and copy the **Client ID** and **Client secret**.
7. Put them in `start.ps1` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and restart it.

**Try it:** My Plan > **Connect Google Calendar** > pick your account. Google shows "Google hasn't verified this app": click **Continue** (normal for an app in Testing), tick both boxes, Continue. Then ask the AI Coach "put my next step in my calendar for tomorrow evening", or press "Send a check-in now" in the email box. In Google Calendar the tasks are in the **Finance for idiots** calendar (left panel, under "My calendars").

If you host the backend later, add the hosted `https://.../google/callback` as a second redirect URI and set `GOOGLE_REDIRECT_URI` to it.

## Activity feed

Everything the coach does is logged with the reason and whether it acted **on its own** (weekly run) or because **the user asked** (chat, email buttons, "Send a check-in now"): emails sent, calendar bookings (the agent must give a `reason` with every `add_task`), weeks where it decided not to book anything and why, actions ticked from an email, and settings changes. `GET /activity/{user_id}` returns it newest first (last 50), and the Home page shows it as "What your coach did".
