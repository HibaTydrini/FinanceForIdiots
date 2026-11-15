
import { useEffect, useRef, useState } from "react";
import "./AIPhone.css";

type Message = {
    id: number;
    role: "user" | "assistant";
    text: string;
};

const welcomeMessage: Message = {
    id: 1,
    role: "assistant",
    text: "Hey! 👋 I'm your Finance for idiots AI coach. Ask me anything about investing!",
};

function getDemoReply(question: string): string {
    const text = question.toLowerCase();

    if (text.includes("portfolio")) {
        return "Your portfolio is the collection of investments you own. I can help you understand diversification and risk!";
    }

    if (text.includes("risk")) {
        return "Investment risk is the possibility of losing money. Different investments have different levels of risk.";
    }

    if (text.includes("stock")) {
        return "A stock represents partial ownership in a company. Its price can increase or decrease over time.";
    }

    if (text.includes("etf")) {
        return "An ETF is a fund containing multiple investments. It can be a useful way to diversify your portfolio.";
    }

    return "I'm currently a demo chatbot! Once my AI agent is connected, I'll be able to answer your questions in more detail.";
}

export default function AIPhone() {
    const [expanded, setExpanded] = useState(false);
    const [visible, setVisible] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        welcomeMessage,
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextId = useRef(2);

    useEffect(() => {
        if (expanded) {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [messages, expanded, loading]);

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    function sendMessage() {
        const question = input.trim();

        if (!question || loading) return;

        const newMessage: Message = {
            id: nextId.current++,
            role: "user",
            text: question,
        };

        setMessages((old) => [...old, newMessage]);
        setInput("");
        setLoading(true);

        timerRef.current = setTimeout(() => {
            const reply: Message = {
                id: nextId.current++,
                role: "assistant",
                text: getDemoReply(question),
            };

            setMessages((old) => [...old, reply]);
            setLoading(false);
            timerRef.current = null;
        }, 900);
    }

    // When hidden, display only the restore button
    if (!visible) {
        return (
            <button
                type="button"
                className="ai-phone-restore"
                onClick={() => setVisible(true)}
                aria-label="Show AI coach"
            >
                💬
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
                    <div className="ai-phone-island" />

                    {!expanded ? (
                        <button
                            type="button"
                            className="ai-phone-preview"
                            onClick={() => setExpanded(true)}
                            aria-label="Open AI chat"
                        >
                            <div className="ai-phone-avatar">FI</div>
                            <h3>Finance AI</h3>
                            <p>Your personal investment coach</p>
                            <span className="ai-phone-open">Tap to chat ↗</span>
                        </button>
                    ) : (
                        <div className="ai-phone-chat">
                            <div className="ai-phone-header">
                                <div className="ai-phone-header-left">
                                    <div className="ai-phone-avatar">FI</div>
                                    <div>
                                        <strong>Finance AI</strong>
                                        <small>● Demo assistant</small>
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
                                            {message.text}
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

                                <div ref={bottomRef} />
                            </div>

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
                                Educational information only.
                            </div>
                        </div>
                    )}

                    <div className="ai-phone-home" />
                </div>
            </div>
        </div>
    );
}
