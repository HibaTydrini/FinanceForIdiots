// Table of contents for the "My Learning Path" page (Cindy's part).
//
// All the content lives in src/data/learningPath.json:
//   chapters -> short topics (like short videos) -> explanation at 3 levels + source links.
// To add a topic, copy one entry in that file and change it.
//
// Click a chapter to open it, then click a topic to see its slides (TopicSlides.tsx).
// focusTopic (from "#dashboard/learning/<topic id>", e.g. a Baby Steps lesson link) opens that
// topic's chapter and topic and scrolls to it.

import { useEffect, useMemo, useState } from "react";
import data from "../../data/learningPath.json";
import "./TableOfContents.css";
import type { Level } from "./learningLevel";
import TopicSlides from "./TopicSlides";
import Icon from "../../shared/Icon";
import type { Topic } from "./TopicSlides";

type Chapter = { title: string; single?: boolean; topics: Topic[] };

const chapters = data.chapters as Chapter[];

function chapterOf(topicId: string | null): number | null {
  if (!topicId) return null;
  const index = chapters.findIndex((ch) => ch.topics.some((t) => t.id === topicId));
  return index >= 0 ? index : null;
}
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
  focusTopic?: string | null;
};

export default function TableOfContents({ initialLevel = "novice", onNavigate, focusTopic = null }: Props) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [openChapter, setOpenChapter] = useState<number | null>(() => chapterOf(focusTopic) ?? 0);
  const [openTopic, setOpenTopic] = useState<string | null>(focusTopic);
  const [search, setSearch] = useState("");

  // App.tsx remounts this (key) when focusTopic changes, so the state above starts on it.
  useEffect(() => {
    if (chapterOf(focusTopic) === null) return;
    // wait for the slides to render, then bring the lesson into view
    const frame = requestAnimationFrame(() =>
      document.getElementById(`lesson-${focusTopic}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [focusTopic]);

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
            <div
              className={`toc-chapter ${isOpen ? "open" : ""}`}
              key={ch.title}
              id={ch.single ? `lesson-${ch.topics[0].id}` : undefined}
            >
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

              {isOpen && ch.single && (
                <div className="toc-single">
                  <TopicSlides
                    topic={ch.topics[0]}
                    level={level}
                    onNavigate={onNavigate}
                  />
                </div>
              )}

              {isOpen && !ch.single && (
                <ul className="toc-topics">
                  {ch.topics.map((t) => {
                    const topicOpen = openTopic === t.id;
                    return (
                      <li key={t.id} id={`lesson-${t.id}`} className="toc-topic">
                        <button
                          className="toc-topic-head"
                          aria-expanded={topicOpen}
                          onClick={() => setOpenTopic(topicOpen ? null : t.id)}
                        >
                          <span className="toc-topic-icon">
                            <Icon name={t.id} size={20} />
                          </span>
                          <span className="toc-topic-text">
                            <strong>{t.title}</strong>
                            <span>{t.summary}</span>
                          </span>
                          <span className="toc-chevron" aria-hidden="true" />
                        </button>
                        {topicOpen && (
                          <TopicSlides
                            key={t.id}
                            topic={t}
                            level={level}
                            onNavigate={onNavigate}
                          />
                        )}
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
