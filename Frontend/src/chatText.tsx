// Shared display helpers for coach answers (AI Coach page and the AI Phone).
import type { ReactNode } from "react";
import type { Source } from "./api";

// Turns "[Source 2]" markers in an answer into links to that NBC page.
export function withSourceLinks(text: string, sources: Source[] = []): ReactNode[] {
  return text.split(/(\[Source \d+\])/g).map((part, i) => {
    const match = part.match(/^\[Source (\d+)\]$/);
    const source = match && sources.find((s) => s.n === Number(match[1]));
    if (!source) return part;
    return (
      <a key={i} className="source-ref" href={source.url} target="_blank" rel="noreferrer">
        [{source.n}]
      </a>
    );
  });
}

// "https://www.nbc.ca/personal/savings-investments/tfsa.html" -> "nbc.ca/personal/…/tfsa.html"
export function shortUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    const path = parts.length > 2 ? `${parts[0]}/…/${parts[parts.length - 1]}` : parts.join("/");
    return `${hostname.replace(/^www\./, "")}/${path}`;
  } catch {
    return url;
  }
}
