import { useEffect, useState } from "react";
import "./NewsFeed.css";
import { fetchNews } from "../coach/api";
import type { NewsItem } from "../coach/api";

// "3 h ago", "2 d ago"
function timeAgo(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.max(0, Math.round((Date.now() / 1000 - seconds) / 60));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

const FALLBACK_SOURCES: NewsItem[] = [
  {
    id: -1,
    url: "https://www.bankofcanada.ca/news/",
    source: "Bank of Canada",
    headline: "Latest Canadian economic and interest-rate news",
    summary: "Read official Bank of Canada announcements, speeches and updates.",
    image: null,
    datetime: null,
  },
  {
    id: -2,
    url: "https://www.cbc.ca/news/business",
    source: "CBC Business",
    headline: "Business and market news from Canada",
    summary: "Follow Canadian companies, markets and the economy.",
    image: null,
    datetime: null,
  },
  {
    id: -3,
    url: "https://www.reuters.com/markets/",
    source: "Reuters Markets",
    headline: "Global markets coverage",
    summary: "Explore current reporting on stocks, bonds, currencies and commodities.",
    image: null,
    datetime: null,
  },
];

// Latest market headlines. When the optional live-news backend is unavailable,
// keep the feature visible with links to reputable news destinations.
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

  const showingFallback = failed || (items !== null && items.length === 0);
  const visibleItems = showingFallback ? FALLBACK_SOURCES : items;

  return (
    <section className="news">
      <p className="eyebrow">IN THE NEWS TODAY</p>
      <h2>What's moving the markets</h2>
      <p className="news-intro">
        {showingFallback
          ? "The live feed is temporarily unavailable. You can still explore these trusted market-news sources."
          : "Headlines from around the financial world. Curious what one means? Ask the AI Coach."}
      </p>

      <div className="news-grid">
        {visibleItems === null
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="news-card news-loading" />)
          : visibleItems.map((item) => (
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
        {showingFallback ? "External news sources are provided for convenience." : "News provided by Finnhub."} Headlines are for information only, not investment advice.
      </p>
    </section>
  );
}
