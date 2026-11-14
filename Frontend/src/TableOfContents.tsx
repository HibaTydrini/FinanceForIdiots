// Table of contents for the "My Learning Path" page (Cindy's part).
//
// All the content lives in src/data/learningPath.json:
//   chapters -> short topics (like short videos) -> explanation at 3 levels + source links.
// To add a topic, copy one entry in that file and change it.
//
// Click a chapter to open it, then click a topic to read it.

import { useMemo, useState } from "react";
import data from "./data/learningPath.json";
import "./TableOfContents.css";
import type { Level } from "./learningLevel";

type Source = { title: string; url: string };
type Action = { label: string; page: string };
type Term = { term: string; meaning: string };
type Topic = {
  id: string;
  title: string;
  summary: string;
  levels: Record<Level, string>;
  example?: string;
  terms?: Term[];
  sources: Source[];
  action?: Action;
};
type Chapter = { title: string; single?: boolean; topics: Topic[] };

const chapters = data.chapters as Chapter[];
const LEVELS: Level[] = ["novice", "intermediate", "expert"];
const LEVEL_LABELS: Record<Level, string> = {
  novice: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

type Props = {
  initialLevel?: Level;
  // Called by topics that link to another page (for example "Go to My Portfolio").
  onNavigate?: (page: string) => void;
};

export default function TableOfContents({ initialLevel = "novice", onNavigate }: Props) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      chapters
        .map((ch, index) => ({
          ...ch,
          index,
          topics: ch.topics.filter(
            (t) =>
              !query ||
              t.title.toLowerCase().includes(query) ||
              t.summary.toLowerCase().includes(query) ||
              ch.title.toLowerCase().includes(query),
          ),
        }))
        .filter((ch) => ch.topics.length > 0),
    [query],
  );

  function topicBody(t: Topic) {
    return (
      <div className="toc-topic-body">
        <p>{t.levels[level]}</p>

        {t.example && (
          <div className="toc-example">
            <span>EXAMPLE</span>
            <p>{t.example}</p>
          </div>
        )}

        {t.terms && t.terms.length > 0 && (
          <div className="toc-terms">
            <span>WORDS TO KNOW</span>
            <dl>
              {t.terms.map((term) => (
                <div key={term.term}>
                  <dt>{term.term}</dt>
                  <dd>{term.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {t.action && onNavigate && (
          <div className="toc-topic-actions">
            <button className="toc-action" onClick={() => onNavigate(t.action!.page)}>
              {t.action.label}
            </button>
          </div>
        )}

        {t.sources.length > 0 && (
          <p className="toc-sources">
            Sources:{" "}
            {t.sources.map((s, k) => (
              <span key={s.url}>
                {k > 0 && " · "}
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              </span>
            ))}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="toc">
      <div className="toc-toolbar">
        <input
          className="toc-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a topic (ETF, TFSA, crypto...)"
          aria-label="Search topics"
        />

        <div className="toc-levels" role="group" aria-label="Explanation level">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              className={lv === level ? "active" : ""}
              aria-pressed={lv === level}
              onClick={() => setLevel(lv)}
            >
              {LEVEL_LABELS[lv]}
            </button>
          ))}
        </div>
      </div>

      <div className="chapter-list">
        {visible.map((ch) => {
          const isOpen = query !== "" || openChapter === ch.index;
          return (
            <div className={`toc-chapter ${isOpen ? "open" : ""}`} key={ch.title}>
              <button
                className="chapter"
                aria-expanded={isOpen}
                onClick={() => setOpenChapter(isOpen ? null : ch.index)}
              >
                <span className="chapter-number">{String(ch.index + 1).padStart(2, "0")}</span>
                <span className="toc-chapter-text">
                  <strong>{ch.title}</strong>
                  {ch.single && <span>{ch.topics[0].summary}</span>}
                </span>
                {!ch.single && <span className="chapter-status">{ch.topics.length} topics</span>}
                <span className="toc-chevron" aria-hidden="true" />
              </button>

              {isOpen && ch.single && <div className="toc-single">{topicBody(ch.topics[0])}</div>}

              {isOpen && !ch.single && (
                <ul className="toc-topics">
                  {ch.topics.map((t, i) => {
                    const topicOpen = openTopic === t.id;
                    return (
                      <li key={t.id} className="toc-topic">
                        <button
                          className="toc-topic-head"
                          aria-expanded={topicOpen}
                          onClick={() => setOpenTopic(topicOpen ? null : t.id)}
                        >
                          <span className="toc-topic-number">
                            {ch.index + 1}.{i + 1}
                          </span>
                          <span className="toc-topic-text">
                            <strong>{t.title}</strong>
                            <span>{t.summary}</span>
                          </span>
                          <span className="toc-chevron" aria-hidden="true" />
                        </button>
                        {topicOpen && topicBody(t)}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <p className="toc-empty">No topic matches your search.</p>}
      </div>

      <p className="disclaimer">{data.disclaimer}</p>
    </div>
  );
}
