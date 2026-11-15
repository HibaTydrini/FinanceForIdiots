import { useEffect, useState } from "react";
import "./NewsFeed.css";
import { fetchNews } from "./api";
import type { NewsItem } from "./api";

// "3 h ago", "2 d ago"
function timeAgo(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.max(0, Math.round((Date.now() / 1000 - seconds) / 60));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

// Latest market headlines on the Home page. Each one links to the original article.
// Hidden entirely if the backend has no Finnhub key or can't be reached.
export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNews(6)
      .then((news) => !cancelled && setItems(news))
      .catch((err) => {
        console.warn("Could not load news:", err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || (items && items.length === 0)) return null;

  return (
    <section className="news">
      <p className="eyebrow">IN THE NEWS TODAY</p>
      <h2>What's moving the markets</h2>
      <p className="news-intro">
        Headlines from around the financial world. Curious what one means? Ask the AI Coach.
      </p>

      <div className="news-grid">
        {items === null
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="news-card news-loading" />)
          : items.map((item) => (
              <a
                key={item.id ?? item.url}
                className="news-card"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="news-body">
                  <span className="news-meta">
                    {item.source}
                    {item.datetime ? ` · ${timeAgo(item.datetime)}` : ""}
                  </span>
                  <h3>{item.headline}</h3>
                  {item.summary && <p>{item.summary}</p>}
                  <span className="feature-link">Read on {item.source || "source"} ↗</span>
                </div>
              </a>
            ))}
      </div>

      <p className="disclaimer">
        News provided by Finnhub. Headlines are for information only, not investment advice.
      </p>
    </section>
  );
}
