// Text with key words underlined. Hover or tap a word to see what it means.
//
// In data/learningPath.json, mark a word with double brackets:
//   "... pays you a [[dividend]] ..."            -> uses the term "Dividend"
//   "... for a [[short-term|Short term]] goal"    -> shows "short-term", explains "Short term"
// Terms come from the topic's "terms" list. Words that are not marked but match
// a term (first time only) are underlined too, so the other levels get it for free.

import type { ReactNode } from "react";

export type TermDef = { term: string; meaning: string };

type Props = { text: string; terms?: TermDef[] };

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Word({ shown, def }: { shown: string; def: TermDef }) {
  return (
    <button type="button" className="term" aria-label={`${shown}: ${def.meaning}`}>
      {shown}
      <span className="term-tip" role="tooltip">
        <strong>{def.term}</strong>
        {def.meaning}
      </span>
    </button>
  );
}

export default function RichText({ text, terms = [] }: Props) {
  const find = (name: string) => terms.find((t) => t.term.toLowerCase() === name.trim().toLowerCase());
  const used = new Set<string>();
  const out: ReactNode[] = [];

  // 1. split on [[...]] marks
  const parts = text.split(/(\[\[[^\]]+\]\])/);
  parts.forEach((part, i) => {
    const mark = part.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
    if (mark) {
      const shown = mark[1];
      const def = find(mark[2] ?? mark[1]);
      if (def) {
        used.add(def.term);
        out.push(<Word key={i} shown={shown} def={def} />);
      } else {
        out.push(shown);
      }
      return;
    }
    out.push(part);
  });

  // 2. underline the first plain mention of terms that were not marked
  const auto = terms.filter((t) => !used.has(t.term) && !t.term.includes(" / "));
  if (auto.length === 0) return <>{out}</>;

  const pattern = new RegExp(`\\b(${auto.map((t) => escape(t.term)).join("|")})(?![\\w-])`, "gi");
  const final: ReactNode[] = [];
  out.forEach((node, i) => {
    if (typeof node !== "string") {
      final.push(node);
      return;
    }
    let last = 0;
    for (const m of node.matchAll(pattern)) {
      const def = find(m[1]);
      if (!def || used.has(def.term) || m.index === undefined) continue;
      used.add(def.term);
      final.push(node.slice(last, m.index));
      final.push(<Word key={`${i}-${m.index}`} shown={m[1]} def={def} />);
      last = m.index + m[1].length;
    }
    final.push(node.slice(last));
  });
  return <>{final}</>;
}
