// Table of contents for the "My Learning Path" page (Cindy's part).
//
// All the content lives in src/data/learningPath.json:
//   chapters -> short topics (like short videos) -> explanation at 3 levels + source links.
// To add a topic, copy one entry in that file and change it.
//
// Click a chapter to open it, then click a topic to see its slides (TopicSlides.tsx).

import { useMemo, useRef, useState } from "react";
import data from "../../data/learningPath.json";
import "./TableOfContents.css";
import type { Level } from "./learningLevel";
import TopicSlides from "./TopicSlides";
import Icon from "../../shared/Icon";
import type { Topic } from "./TopicSlides";

// "video" is a file in Frontend/public/, for example "videos/mutual-funds.mp4".
// A chapter with a video plays it first; its topics (or slides) show after "Review concepts here".
type Chapter = { title: string; single?: boolean; video?: string; videoCover?: string; topics: Topic[] };

// Without onReview (video next to the slides), the "Review concepts here" button is not shown.
function ChapterVideo({ src, cover, title, done = false, onReview }: { src: string; cover?: string; title: string; done?: boolean; onReview?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    setStarted(true);
    void ref.current?.play();
  };

  // full screen; Safari on iPhone only supports its own video full screen
  const expand = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    play();
    if (v.requestFullscreen) void v.requestFullscreen();
    else v.webkitEnterFullscreen?.();
  };

  return (
    <div className="toc-video">
      <div className="toc-video-frame">
        <video
          ref={ref}
          src={import.meta.env.BASE_URL + src}
          poster={cover ? import.meta.env.BASE_URL + cover : undefined}
          controls={started}
          playsInline
          preload="metadata"
          aria-label={`Video: ${title}`}
          onPlay={() => {
            setStarted(true);
            setEnded(false);
          }}
          onEnded={() => setEnded(true)}
        />
        {!started && (
          <button className="toc-video-play" onClick={play} aria-label={`Play video: ${title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </button>
        )}
        <button className="toc-video-expand" onClick={expand} aria-label="Watch full screen" title="Full screen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          </svg>
        </button>
      </div>
      {onReview && !done && (
        <div className="toc-video-actions">
          {ended ? (
            <button className="toc-video-review" onClick={onReview}>
              Review concepts here
            </button>
          ) : (
            <button className="toc-video-skip" onClick={onReview}>
              Skip to the topics
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
  // chapters whose topics were revealed after the video
  const [reviewed, setReviewed] = useState<number[]>([]);

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

              {/* one-topic chapter with a video: video on the left, slides on the right */}
              {isOpen && ch.single && ch.video && (
                <div className="toc-single toc-split">
                  <ChapterVideo src={ch.video} cover={ch.videoCover} title={ch.title} />
                  <TopicSlides
                    topic={ch.topics[0]}
                    level={level}
                    onNavigate={onNavigate}
                  />
                </div>
              )}

              {isOpen && !ch.single && ch.video && query === "" && (
                <ChapterVideo
                  src={ch.video}
                  cover={ch.videoCover}
                  title={ch.title}
                  done={reviewed.includes(ch.index)}
                  onReview={() => setReviewed((r) => [...r, ch.index])}
                />
              )}

              {isOpen && ch.single && !ch.video && (
                <div className="toc-single">
                  <TopicSlides
                    topic={ch.topics[0]}
                    level={level}
                    onNavigate={onNavigate}
                  />
                </div>
              )}

              {isOpen && !ch.single && (!ch.video || query !== "" || reviewed.includes(ch.index)) && (
                <ul className="toc-topics">
                  {ch.topics.map((t) => {
                    const topicOpen = openTopic === t.id;
                    return (
                      <li key={t.id} className="toc-topic">
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
