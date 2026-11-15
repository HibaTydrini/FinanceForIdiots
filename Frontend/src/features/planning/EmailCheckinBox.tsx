// "Weekly email check-ins": opt-in box on My Plan and the demo "Send a check-in now" button.
// The backend (backend/app.py) writes the email with Bedrock and sends it with Amazon SES;
// Amazon EventBridge triggers the weekly run.
// If the server already has an address for this account (or the user signed in with one), the box
// doesn't ask for it again: turning check-ins on is one click, and changing the address is optional.
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { getProgress, putProgress, sendCheckin } from "../coach/api";
import { flushProgress } from "./babyStepsStore";
import { useFlash } from "./useFlash";

export default function EmailCheckinBox() {
  const [address, setAddress] = useState(""); // the address on file (server, or the sign-in email)
  const [draft, setDraft] = useState(""); // what's typed while changing it
  const [on, setOn] = useState(false); // the server sends weekly check-ins to `address`
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, flash] = useFlash();

  // Show what the server has (the email's "Turn off check-ins" link turns it off there).
  // Otherwise suggest the email the user signed in with.
  useEffect(() => {
    let cancelled = false;
    getProgress()
      .catch(() => null) // backend unreachable: still try the sign-in email
      .then(async (progress) => {
        if (cancelled) return;
        if (progress?.email?.address) {
          setAddress(progress.email.address);
          setOn(progress.email.consent);
        } else {
          try {
            const { email } = await fetchUserAttributes();
            if (!cancelled && email) setAddress(email);
          } catch {
            // not signed in: the box asks for an address
          }
        }
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(nextAddress: string, consent: boolean) {
    setBusy(true);
    flash(null);
    try {
      await flushProgress(); // make sure the server has the plan first
      await putProgress({ email: { address: nextAddress, consent } });
      setAddress(nextAddress);
      setOn(consent);
      setEditing(false);
      flash({ kind: "ok", text: consent ? "Check-ins are on." : "Check-ins are off." });
    } catch (e) {
      flash({ kind: "error", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  async function sendNow() {
    setBusy(true);
    flash(null);
    try {
      await flushProgress(); // the email is written from the latest plan
      const { to } = await sendCheckin();
      flash({ kind: "ok", text: `Sent to ${to}. Check your inbox (and spam).` });
    } catch (e) {
      flash({ kind: "error", text: e instanceof Error ? e.message : "Could not send." });
    } finally {
      setBusy(false);
    }
  }

  function startEditing() {
    setDraft(address);
    setEditing(true);
    flash(null);
  }

  if (!loaded) return <p className="plan-text">Loading…</p>;

  const asking = editing || !address;

  return (
    <div className="plan-email">
      <p className="plan-text">A short email about your next step. Answer in one click, turn it off anytime.</p>

      {asking ? (
        <form
          className="plan-email-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) void save(draft.trim(), true);
          }}
        >
          <label className="plan-field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="sam@example.com"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
            />
          </label>
          <div className="plan-email-buttons">
            <button type="submit" className="primary" disabled={busy || !draft.trim()}>
              Email me weekly
            </button>
            {address && (
              <button type="button" className="secondary" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <>
          <p className="plan-email-to">
            {on ? "Sending to " : "Send to "}
            <strong>{address}</strong>{" "}
            <button type="button" className="plan-link" onClick={startEditing} disabled={busy}>
              Change
            </button>
          </p>
          <div className="plan-email-buttons">
            {on ? (
              <>
                <button type="button" className="primary" onClick={sendNow} disabled={busy}>
                  Send one now
                </button>
                <button type="button" className="secondary" onClick={() => save(address, false)} disabled={busy}>
                  Turn off
                </button>
              </>
            ) : (
              <button type="button" className="primary" onClick={() => save(address, true)} disabled={busy}>
                Turn on weekly emails
              </button>
            )}
          </div>
        </>
      )}

      {status && (
        <p className={`plan-status ${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>
          {status.text}
        </p>
      )}
    </div>
  );
}
