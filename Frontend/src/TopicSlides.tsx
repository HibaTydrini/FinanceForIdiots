// One topic shown as a few short slides (like a short video).
// Slides are made automatically from the topic in data/learningPath.json:
//   1. the idea (big icon + short explanation)
//   2. a drawn scene (scenes.tsx) or, when numbers explain it, a graph (charts.tsx)
//   3. an easy example
//   4. popular examples (a simple vertical list)
// Sources (and a button like "Go to My Portfolio") sit in a small footer under the slides.
// Key words are underlined inside the text (RichText.tsx): hover or tap to see the meaning.
// A slide is skipped when the topic has nothing for it.

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { Level } from "./learningLevel";
import Icon from "./Icon";
import { CHARTS } from "./charts";
import { SCENES } from "./scenes";
import RichText from "./RichText";

export type Source = { title: string; url: string };
export type Topic = {
  id: string;
  title: string;
  summary: string;
  levels: Record<Level, string>;
  example?: string;
  highlights?: { title: string; items: { name: string; detail: string }[] };
  terms?: { term: string; meaning: string }[];
  sources: Source[];
  action?: { label: string; page: string };
};

type Slide = { key: string; label: string; body: ReactNode };

type Props = {
  topic: Topic;
  level: Level;
  onNavigate?: (page: string) => void;
};

export default function TopicSlides({ topic: t, level, onNavigate }: Props) {
  const [index, setIndex] = useState(0);

  const slides: Slide[] = [
    {
      key: "idea",
      label: "The idea",
      body: (
        <div className="slide-idea">
          <div className="slide-icon">
            <Icon name={t.id} size={54} />
          </div>
          <div>
            <h3>{t.title}</h3>
            <p className="slide-lead">
              <RichText text={t.levels[level]} terms={t.terms} />
            </p>
          </div>
        </div>
      ),
    },
  ];

  const picture = SCENES[t.id] ?? CHARTS[t.id];
  if (picture) {
    slides.push({
      key: "picture",
      label: "See it",
      body: (
        <figure className="slide-picture">
          {picture.art}
          <figcaption>{picture.caption}</figcaption>
        </figure>
      ),
    });
  }

  if (t.example) {
    slides.push({
      key: "example",
      label: "Example",
      body: (
        <div className="slide-example">
          <div className="slide-icon small">
            <Icon name="example" size={34} />
          </div>
          <div>
            <h3>Picture this</h3>
            <p className="slide-lead">
              <RichText text={t.example} terms={t.terms} />
            </p>
          </div>
        </div>
      ),
    });
  }

  if (t.highlights && t.highlights.items.length > 0) {
    slides.push({
      key: "highlights",
      label: t.highlights.title,
      body: (
        <div>
          <h3>{t.highlights.title}</h3>
          <ul className="slide-list">
            {t.highlights.items.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    });
  }

  const last = slides.length - 1;
  const current = Math.min(index, last);
  const go = (i: number) => setIndex(Math.max(0, Math.min(last, i)));

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  }

  return (
    <div
      className="slides"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="slides"
      aria-label={t.title}
    >
      <div className="slide-top">
        <span className="slide-label">{slides[current].label}</span>
        <span className="slide-count">
          {current + 1} / {slides.length}
        </span>
      </div>

      <div className="slide" key={slides[current].key} aria-live="polite">
        {slides[current].body}
      </div>

      <div className="slide-nav">
        <button className="slide-arrow" onClick={() => go(current - 1)} disabled={current === 0}>
          ← Back
        </button>
        <div className="slide-dots">
          {slides.map((s, i) => (
            <button
              key={s.key}
              className={i === current ? "active" : ""}
              aria-label={`Slide ${i + 1}: ${s.label}`}
              aria-current={i === current}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          className="slide-arrow next"
          onClick={() => go(current + 1)}
          disabled={current === last}
        >
          Next →
        </button>
      </div>

      {(t.sources.length > 0 || (t.action && onNavigate)) && (
        <div className="slide-footer">
          {t.action && onNavigate && (
            <button className="toc-action" onClick={() => onNavigate(t.action!.page)}>
              {t.action.label}
            </button>
          )}
          {t.sources.length > 0 && (
            <p className="toc-sources">
              Sources:{" "}
              {t.sources.map((src, k) => (
                <span key={src.url}>
                  {k > 0 && " · "}
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.title}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
