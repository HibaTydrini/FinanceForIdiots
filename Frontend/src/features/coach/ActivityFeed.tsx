// "What your coach did" on Home: every action the AI coach took (emails, calendar bookings,
// ticks, decisions not to act), with the reason, and whether it acted on its own or because you asked.
import { useEffect, useState } from "react";
import { getActivity } from "./api";
import Icon from "../../shared/Icon";
import type { Activity } from "./api";
import "./ActivityFeed.css";

type Props = { onNavigate: (page: string) => void };

const ICONS: Record<Activity["kind"], string> = {
  email: "mail",
  calendar: "calendar",
  skip: "skip",
  tick: "done",
  answer: "chat",
  settings: "settings",
};

const SHOWN = 3;

function when(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, ${time}`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export default function ActivityFeed({ onNavigate }: Props) {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getActivity()
        .then((list) => {
          if (cancelled) return;
          setItems(list);
          setOffline(false);
        })
        .catch(() => !cancelled && setOffline(true));
    void load();
    // the weekly run or the AI Coach can act while this page is open
    const timer = setInterval(() => document.visibilityState === "visible" && void load(), 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const visible = items && (showAll ? items : items.slice(0, SHOWN));

  return (
    <div className="activity-card">
      <p className="eyebrow">YOUR AI COACH</p>
      <h2>What your coach did</h2>
      <p className="activity-intro">It works on your plan between visits. Here's what it did, and why.</p>

      {offline && !items && <p className="activity-intro">Can't reach the server right now.</p>}

      {items && items.length === 0 && (
        <button type="button" className="activity-more" onClick={() => onNavigate("plan")}>
          Turn on check-ins on My Plan →
        </button>
      )}

      {visible && visible.length > 0 && (
        <ul className="activity-list">
          {visible.map((item, i) => (
            <li key={`${item.at}-${i}`} className="activity-item">
              <Icon name={ICONS[item.kind] ?? "example"} size={22} className="activity-icon" />
              <div className="activity-body">
                <p className="activity-title">
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="activity-reason">{item.reason}</p>
              </div>
              <div className="activity-meta">
                <time dateTime={item.at}>{when(item.at)}</time>
                {item.by === "own" && <span className="activity-own">ON ITS OWN</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {items && items.length > SHOWN && (
        <button type="button" className="activity-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show less" : `See all ${items.length} →`}
        </button>
      )}
    </div>
  );
}
