// "Your AI coach books it in Google Calendar" on My Plan: connect Google Calendar, see what the agent booked.
// The agent (backend/app.py, run_agent) adds tasks to its own "Finance For Dummies" calendar: on its own
// during the weekly check-in, and when the user asks the AI Coach ("plan my week").
import { useEffect, useState } from "react";
import { disconnectCalendar, getCalendarStatus, googleConnectUrl } from "../coach/api";
import type { CalendarStatus } from "../coach/api";
import { flushProgress } from "./babyStepsStore";

type Props = { onNavigate: (page: string) => void };

export default function CalendarBox({ onNavigate }: Props) {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    await flushProgress(); // the agent plans from the latest plan and time zone
    window.location.href = googleConnectUrl();
  }

  async function disconnect() {
    setBusy(true);
    try {
      await disconnectCalendar();
      setStatus((s) => (s ? { ...s, connected: false, upcoming: [] } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not disconnect.");
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
      <p className="plan-text">
        Connect Google Calendar and your AI coach books time for your next step every week, in a separate
        "Finance For Dummies" calendar. It only sees when you're busy, never what your other events are, and it
        never books anything about buying or selling.
      </p>

      {status.connected ? (
        <>
          <p className="plan-status ok" role="status">
            ✓ Google Calendar is connected.
          </p>
          {status.upcoming.length > 0 ? (
            <ul className="plan-list">
              {status.upcoming.map((task) => (
                <li key={`${task.title}-${task.start}`}>
                  <strong>{task.start}</strong>: {task.title}
                  {task.link && (
                    <>
                      {" "}
                      (<a href={task.link} target="_blank" rel="noreferrer">open</a>)
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="plan-text">Nothing booked yet. The next weekly check-in will book your next step.</p>
          )}
          <div className="plan-email-buttons">
            <button type="button" className="primary" onClick={() => onNavigate("coach")}>
              Ask the AI Coach to plan my week
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
      {error && (
        <p className="plan-status error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
