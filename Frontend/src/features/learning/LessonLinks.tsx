// A short list of lessons, using the same rows as the Learning Path (TableOfContents.tsx).
// Used by Baby Steps, My Plan and the check-in.
// - With onOpenLesson, each row is a link: it sends the user to that lesson on the Learn page.
// - Without it, the lesson opens in place with the real TopicSlides, so the AI Phone's
//   "explain this" keeps working.
import { useState } from "react";
import "./TableOfContents.css";
import Icon from "../../shared/Icon";
import TopicSlides from "./TopicSlides";
import { topicById } from "./lessons";
import type { Level } from "./learningLevel";

type Props = {
  topics: string[];
  level: Level;
  openFirst?: boolean;
  onNavigate?: (page: string) => void;
  onOpenLesson?: (topicId: string) => void;
};

export default function LessonLinks({ topics, level, openFirst = false, onNavigate, onOpenLesson }: Props) {
  const [open, setOpen] = useState<string | null>(openFirst && !onOpenLesson ? (topics[0] ?? null) : null);

  return (
    <ul className={`toc-topics lesson-links ${onOpenLesson ? "as-links" : ""}`}>
      {topics.map((id) => {
        const topic = topicById(id);
        if (!topic) return null;
        const isOpen = open === id;
        return (
          <li key={id} className="toc-topic">
            <button
              className="toc-topic-head"
              aria-expanded={onOpenLesson ? undefined : isOpen}
              onClick={() => (onOpenLesson ? onOpenLesson(id) : setOpen(isOpen ? null : id))}
            >
              <span className="toc-topic-icon">
                <Icon name={id} size={20} />
              </span>
              <span className="toc-topic-text">
                <strong>{topic.title}</strong>
                {!onOpenLesson && <span>{topic.summary}</span>}
              </span>
              {onOpenLesson ? (
                <span className="lesson-go">Open lesson →</span>
              ) : (
                <span className="toc-chevron" aria-hidden="true" />
              )}
            </button>
            {isOpen && <TopicSlides key={id} topic={topic} level={level} onNavigate={onNavigate} />}
          </li>
        );
      })}
    </ul>
  );
}
