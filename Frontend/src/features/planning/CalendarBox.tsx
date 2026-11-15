// "Your AI coach books it in Google Calendar" on My Plan: connect Google Calendar, see what the agent booked.
// The agent (backend/app.py, run_agent) adds tasks to its own "Finance For Dummies" calendar: on its own
// during the weekly check-in, and when the user asks the AI Coach ("plan my week").
import { useEffect, useState } from "react";
import { disconnectCalendar, getCalendarStatus, googleConnectUrl } from "../coach/api";
import type { CalendarStatus } from "../coach/api";
import { flushProgress } from "./babyStepsStore";
import { useFlash } from "./useFlash";

type Props = { onNavigate: (page: string) => void };

export default function CalendarBox({ onNavigate }: Props) {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [error, setError] = useState(""); // can't load the status (cleared by the next good load)
  const [busy, setBusy] = useState(false);
  const [flash, showFlash] = useFlash(); // result of the last button press

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getCalendarStatus()
        .then((s) => !cancelled && (setStatus(s), setError("")))
        .catch(() => !cancelled && setError("Can't reach the server right now."));
    void load();
    // the AI Coach may book something while this page is open
    const timer = setInterval(() => document.visibilityState === "visible" && void load(), 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  async function connect() {
    setBusy(true);
    showFlash(null);
    await flushProgress(); // the agent plans from the latest plan and time zone
    window.location.href = googleConnectUrl();
  }

  async function disconnect() {
    setBusy(true);
    showFlash(null);
    try {
      await disconnectCalendar();
      setStatus((s) => (s ? { ...s, connected: false, upcoming: [] } : s));
      showFlash({ kind: "ok", text: "Disconnected." });
    } catch (e) {
      showFlash({ kind: "error", text: e instanceof Error ? e.message : "Could not disconnect." });
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return <p className="plan-text">{error || "Loading…"}</p>;
  }

  if (!status.configured) {
    return (
      <p className="plan-text">
        Google Calendar isn't set up on the server yet (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, see the backend
        README).
      </p>
    );
  }

  return (
    <div className="plan-email">
      <p className="plan-text">Your coach books time for your next step each week. It only sees when you're busy.</p>

      {status.connected ? (
        <>
          <p className="plan-status ok">Connected</p>
          <p className="plan-text plan-cal-summary">
            {status.upcoming.length === 0
              ? "Nothing booked yet."
              : `${status.upcoming.length} ${status.upcoming.length === 1 ? "session" : "sessions"} booked, next on ${status.upcoming[0].start}.`}{" "}
            <a href="https://calendar.google.com" target="_blank" rel="noreferrer">
              Open Google Calendar →
            </a>
          </p>
          <div className="plan-email-buttons">
            <button type="button" className="primary" onClick={() => onNavigate("coach")}>
              Plan my week
            </button>
            <button type="button" className="secondary" onClick={disconnect} disabled={busy}>
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <div className="plan-email-buttons">
          <button type="button" className="primary" onClick={connect} disabled={busy}>
            Connect Google Calendar
          </button>
        </div>
      )}
      {(flash || error) && (
        <p className={`plan-status ${flash?.kind ?? "error"}`} role={flash?.kind === "ok" ? "status" : "alert"}>
          {flash?.text ?? error}
        </p>
      )}
    </div>
  );
}
