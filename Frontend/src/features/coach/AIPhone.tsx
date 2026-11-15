
import { useEffect, useRef, useState } from "react";
import "./AIPhone.css";
import { sendChat } from "./api";
import { ASK_EVENT } from "./askPhone";
import type { Source } from "./api";
import { shortUrl, withSourceLinks } from "./chatText";
import { usePageContext } from "../../app/pageContext";
import { coachContext, readQuizAnswers, useBabySteps } from "../planning/babyStepsStore";
import { readActiveProfile } from "../onboarding/onboarding";
import { demoPortfolioForCoach, findDemoPortfolio } from "../portfolio/demoPortfolioContext";

// Answers come from the same backend as the AI Coach page (backend/app.py: NBC knowledge
// base + the user's quiz profile). The phone keeps its own conversation.

type Message = {
    id: number;
    role: "user" | "assistant";
    text: string;
    sources?: Source[];
};

const welcomeMessage: Message = {
    id: 1,
    role: "assistant",
    text: "Hi! I'm your Finance For Dummies AI coach. Ask me anything about investing, wherever you are on the site. My answers come from National Bank's website.",
};

export default function AIPhone() {
    const [expanded, setExpanded] = useState(false);
    const [visible, setVisible] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        welcomeMessage,
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { page, lesson, step } = usePageContext();
    const { state: babySteps } = useBabySteps();

    const bottomRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(2);

    useEffect(() => {
        if (expanded) {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [messages, expanded, loading, error]);

    async function sendMessage(text?: string) {
        const question = (text ?? input).trim();

        if (!question || loading) return;

        // Earlier questions and answers, so follow-ups work. The welcome message is left out:
        // the conversation sent to the model must start with a question.
        const history = messages.filter((m) => m.id !== welcomeMessage.id);

        const newMessage: Message = {
            id: nextId.current++,
            role: "user",
            text: question,
        };

        setMessages((old) => [...old, newMessage]);
        if (text === undefined) setInput("");
        setError("");
        setLoading(true);

        try {
            // Send what's on screen so questions like "explain this" make sense.
            // Baby Steps progress and plan go along too, so "what should I do next?" works.
            const progress = coachContext(babySteps, readQuizAnswers(), step);
            const context = page ? { page, lesson, ...progress } : progress;
            const demo = findDemoPortfolio(readActiveProfile()?.demoClientId);
            const { answer, sources } = await sendChat(
                question,
                history,
                demo ? demoPortfolioForCoach(demo) : undefined,
                context,
                true, // brief: the phone screen is small
            );
            const reply: Message = {
                id: nextId.current++,
                role: "assistant",
                text: answer,
                sources,
            };
            setMessages((old) => [...old, reply]);
        } catch {
            // Remove the unanswered question so questions and answers stay in pairs,
            // and put it back in the box so the user can resend it.
            setMessages((old) => old.filter((m) => m.id !== newMessage.id));
            setInput(question);
            setError("I couldn't answer right now. Is the backend running? Try again.");
        } finally {
            setLoading(false);
        }
    }

    // askPhone(): open the phone and send the question. The ref keeps the listener on the latest sendMessage.
    const sendRef = useRef(sendMessage);
    useEffect(() => {
        sendRef.current = sendMessage;
    });
    useEffect(() => {
        const onAsk = (e: Event) => {
            const question = (e as CustomEvent<string>).detail;
            if (!question) return;
            setVisible(true);
            setExpanded(true);
            void sendRef.current(question);
        };
        window.addEventListener(ASK_EVENT, onAsk);
        return () => window.removeEventListener(ASK_EVENT, onAsk);
    }, []);

    // When hidden, display only the restore button
    if (!visible) {
        return (
            <button
                type="button"
                className="ai-phone-restore"
                onClick={() => setVisible(true)}
                aria-label="Show AI coach"
            >
                FD
            </button>
        );
    }

    return (
        <div className={`ai-phone ${expanded ? "expanded" : "collapsed"}`}>
            {!expanded && (
                <button
                    type="button"
                    className="ai-phone-hide"
                    onClick={() => setVisible(false)}
                    aria-label="Hide AI coach"
                >
                    ×
                </button>
            )}

            <div className="ai-phone-frame">
                <div className="ai-phone-screen">
                    {!expanded ? (
                        <button
                            type="button"
                            className="ai-phone-preview"
                            onClick={() => setExpanded(true)}
                            aria-label="Open AI chat"
                        >
                            <div className="ai-phone-avatar">FD</div>
                            <h3>Finance AI</h3>
                            <p>Your personal investment coach</p>
                            <span className="ai-phone-open">Tap to chat ↗</span>
                        </button>
                    ) : (
                        <div className="ai-phone-chat">
                            <div className="ai-phone-header">
                                <div className="ai-phone-header-left">
                                    <div className="ai-phone-avatar">FD</div>
                                    <div>
                                        <strong>Finance AI</strong>
                                        <small>● Answers from NBC</small>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="ai-phone-close"
                                    onClick={() => setExpanded(false)}
                                    aria-label="Minimize chat"
                                >
                                    −
                                </button>
                            </div>

                            <div className="ai-phone-messages">
                                <div className="ai-phone-today">Today</div>

                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`ai-phone-message ${message.role}`}
                                    >
                                        <div className="ai-phone-bubble">
                                            {withSourceLinks(message.text, message.sources)}

                                            {message.sources && message.sources.length > 0 && (
                                                <ol className="ai-phone-sources">
                                                    {message.sources.map((source) => (
                                                        <li key={source.n}>
                                                            <a href={source.url} target="_blank" rel="noreferrer">
                                                                {shortUrl(source.url)}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="ai-phone-message assistant">
                                        <div className="ai-phone-bubble">
                                            Typing...
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="ai-phone-error" role="alert">
                                        {error}
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>

                            {lesson && (
                                <div className="ai-phone-context" title="The coach can see this lesson. Ask &quot;explain this&quot;.">
                                    Looking at: <strong>{lesson.topic}</strong> · {lesson.slide}
                                </div>
                            )}

                            <form
                                className="ai-phone-input"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendMessage();
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    aria-label="Chat message"
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    aria-label="Send message"
                                >
                                    ↑
                                </button>
                            </form>

                            <div className="ai-phone-disclaimer">
                                Educational, not financial advice. Check the sources.
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
