// A short list of lessons that open in place, using the same rows and slides as the
// Learning Path (TableOfContents.tsx). Used by Baby Steps and My Plan.
// Because the slides are the real TopicSlides, the AI Phone's "explain this" keeps working.
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
};

export default function LessonLinks({ topics, level, openFirst = false, onNavigate }: Props) {
  const [open, setOpen] = useState<string | null>(openFirst ? (topics[0] ?? null) : null);

  return (
    <ul className="toc-topics lesson-links">
      {topics.map((id) => {
        const topic = topicById(id);
        if (!topic) return null;
        const isOpen = open === id;
        return (
          <li key={id} className="toc-topic">
            <button
              className="toc-topic-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : id)}
            >
              <span className="toc-topic-icon">
                <Icon name={id} size={20} />
              </span>
              <span className="toc-topic-text">
                <strong>{topic.title}</strong>
                <span>{topic.summary}</span>
              </span>
              <span className="toc-chevron" aria-hidden="true" />
            </button>
            {isOpen && <TopicSlides key={id} topic={topic} level={level} onNavigate={onNavigate} />}
          </li>
        );
      })}
    </ul>
  );
}
