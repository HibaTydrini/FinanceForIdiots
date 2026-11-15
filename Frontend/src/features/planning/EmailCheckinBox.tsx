// "Weekly email check-ins": opt-in box on My Plan (email address + consent) and the demo
// "Send a check-in now" button. The backend (backend/app.py) writes the email with Bedrock and
// sends it with Amazon SES; Amazon EventBridge triggers the weekly run.
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { getProgress, putProgress, sendCheckin } from "../coach/api";
import { flushProgress } from "./babyStepsStore";

type Status = { kind: "ok" | "error"; text: string } | null;

export default function EmailCheckinBox() {
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false); // the server has this address with consent
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  // Show what the server has (the email's "Turn off check-ins" link turns consent off there).
  // Otherwise suggest the email the user signed in with.
  useEffect(() => {
    let cancelled = false;
    getProgress()
      .catch(() => null) // backend unreachable: still try the sign-in email
      .then(async (progress) => {
        if (cancelled) return;
        if (progress?.email?.address) {
          setAddress(progress.email.address);
          setConsent(progress.email.consent);
          setSaved(progress.email.consent);
          return;
        }
        try {
          const { email } = await fetchUserAttributes();
          if (!cancelled && email) setAddress((current) => current || email);
        } catch {
          // not signed in: leave the field empty
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      await flushProgress(); // make sure the server has the plan first
      await putProgress({ email: { address: address.trim(), consent } });
      setSaved(consent);
      setStatus({
        kind: "ok",
        text: consent ? "Saved. You'll get a check-in email every week." : "Saved. Check-ins are off.",
      });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  async function sendNow() {
    setBusy(true);
    setStatus(null);
    try {
      await flushProgress(); // the email is written from the latest plan
      const { to } = await sendCheckin();
      setStatus({ kind: "ok", text: `Check-in sent to ${to}. Check your inbox (and the spam folder).` });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Could not send." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="plan-email">
      <p className="plan-text">
        Once a week, get a short email about your next step, written for your plan. Answer with one click:
        "I did it" ticks it off here, "I need help" opens the AI Coach. It never tells you what to buy or sell,
        and every email has a link to turn it off.
      </p>
      <label className="plan-field">
        <span>Email address</span>
        <input
          type="email"
          autoComplete="email"
          placeholder="sam@example.com"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <label className="plan-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Yes, email me a weekly check-in about my plan.</span>
      </label>
      <div className="plan-email-buttons">
        <button type="button" className="primary" onClick={save} disabled={busy || (consent && !address.trim())}>
          Save
        </button>
        <button type="button" className="secondary" onClick={sendNow} disabled={busy || !saved}>
          Send a check-in now
        </button>
      </div>
      {status && (
        <p className={`plan-status ${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>
          {status.text}
        </p>
      )}
    </div>
  );
}
