import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import "./Coach.css";
import { sendChat } from "./api";
import type { ChatMessage, Source } from "./api";

type Props = {
  // Kept in App so the conversation survives switching pages.
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  // Greeting to show instead of the default one (e.g. for a demo client).
  intro?: string;
  // Demo portfolio the coach can talk about, sent with each question.
  portfolio?: object;
};

// Turns "[Source 2]" markers in an answer into links to that NBC page.
function withSourceLinks(text: string, sources: Source[] = []): ReactNode[] {
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
function shortUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    const path = parts.length > 2 ? `${parts[0]}/…/${parts[parts.length - 1]}` : parts.join("/");
    return `${hostname.replace(/^www\./, "")}/${path}`;
  } catch {
    return url;
  }
}

export default function Coach({ messages, setMessages, intro, portfolio }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const history = messages; // only complete question/answer pairs
    setMessages([...history, { role: "user", text: question }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const { answer, sources } = await sendChat(question, history, portfolio);
      setMessages([...history, { role: "user", text: question }, { role: "assistant", text: answer, sources }]);
    } catch {
      // Remove the unanswered question so the history stays in pairs, and give it back for retrying.
      setMessages(history);
      setInput(question);
      setError("The coach couldn't answer. Check that the backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="chat-box">
        <div className="coach-intro">
          <span className="coach-avatar">F.</span>
          <div>
            <strong>Finance for idiots Coach</strong>
            <p>{intro ?? "Hi! What would you like to learn today? My answers come from National Bank's website."}</p>
          </div>
        </div>

        {messages.map((message, index) =>
          message.role === "user" ? (
            <div className="user-message" key={index}>
              {message.text}
            </div>
          ) : (
            <div className="coach-message" key={index}>
              <p className="coach-text">{withSourceLinks(message.text, message.sources)}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="coach-sources">
                  <span>Sources</span>
                  <ol>
                    {message.sources.map((source) => (
                      <li key={source.n}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {shortUrl(source.url)}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ),
        )}

        {loading && (
          <div className="coach-message coach-typing" aria-live="polite">
            Looking through National Bank's resources…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="chat-error" role="alert">{error}</p>}

      <form className="chat-form" onSubmit={ask}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask me anything about investing..."
          aria-label="Your question"
        />
        <button className="primary" type="submit" disabled={loading || !input.trim()}>
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>
    </>
  );
}
