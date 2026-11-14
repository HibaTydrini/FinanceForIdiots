
import { useState } from "react";
import "./App.css";
import TableOfContents from "./TableOfContents";
import { levelFromKnowledge } from "./learningLevel";

type Page = "onboarding" | "home" | "learning" | "profile" | "coach" | "portfolio";

const questions = [
  {
    title: "How would you describe your investing knowledge?",
    options: [
      "I'm completely new",
      "I know the basics",
      "I understand stocks, ETFs, and risk",
      "I'm experienced",
    ],
  },
  {
    title: "What is your main investment goal?",
    options: [
      "Grow my wealth",
      "Save for a major purchase",
      "Prepare for retirement",
      "Generate additional income",
      "I'm not sure yet",
    ],
  },
  {
    title: "When do you expect to need your invested money?",
    options: [
      "Within 1 year",
      "In 1–3 years",
      "In 3–5 years",
      "In more than 5 years",
      "I'm not sure",
    ],
  },
  {
    title: "How would you react if your investments dropped 20%?",
    options: [
      "I would sell",
      "I would be worried but hold",
      "I would hold and accept the volatility",
      "I would review whether to buy more",
      "I'm not sure",
    ],
  },
  {
  title: "What do you want Finance for idiots to help you with?",
  options: [
    "Learn how investing works",
    "Understand my portfolio",
    "Research investment opportunities",
    "Understand investment risks",
    "A combination of these",
  ],
},
{
  title: "Would you like to connect your National Bank investment account?",
  options: [
    "Yes, connect my National Bank account",
    "No, I'll use a demo portfolio",
  ],
},
];

const features = [
  {
    number: "01",
    title: "My Learning Path",
    description: "Learn investing step by step, at your own pace.",
    page: "learning" as Page,
  },
  {
    number: "02",
    title: "My Investor Profile",
    description: "Explore your goals, knowledge and comfort with risk.",
    page: "profile" as Page,
  },
  {
    number: "03",
    title: "AI Coach",
    description: "Get explanations and answers to your finance questions.",
    page: "coach" as Page,
  },
  {
    number: "04",
    title: "My Portfolio",
    description: "Understand your investments and explore scenarios.",
    page: "portfolio" as Page,
  },
];


function App() {
  // The opening quiz is skipped for now: the site starts on the home page.
  // Change "home" back to "onboarding" to show the quiz again.
  const [page, setPage] = useState<Page>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  function nextQuestion() {
    if (!selected) return;

    const updated = [...answers];
    updated[step] = selected;
    setAnswers(updated);

    if (step === questions.length - 1) {
      setPage("home");
    } else {
      setStep(step + 1);
      setSelected(updated[step + 1] || "");
    }
  }

  function previousQuestion() {
    if (step === 0) return;
    setStep(step - 1);
    setSelected(answers[step - 1] || "");
  }

  return (
    <div className="app">
      <header className="header">
        <button className="logo" onClick={() => setPage("home")}>
          <span className="logo-icon">F.</span>
          <span>Finance for idiots</span>
        </button>

        {page !== "onboarding" && (
          <nav>
            <button onClick={() => setPage("home")}>Home</button>
            <button onClick={() => setPage("learning")}>Learn</button>
            <button onClick={() => setPage("profile")}>Profile</button>
            <button onClick={() => setPage("coach")}>AI Coach</button>
            <button onClick={() => setPage("portfolio")}>Portfolio</button>
          </nav>
        )}
      </header>

      <main>
        {page === "onboarding" && (
          <section className="onboarding">
            <p className="eyebrow">LET'S GET TO KNOW YOU</p>
            <div className="progress-label">
              <span>Your investor journey</span>
              <span>Question {step + 1} of 6</span>
            </div>
            <div className="progress">
              <div style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>

            <h1>{questions[step].title}</h1>
            <p className="subtitle">
              Your answer will help us personalize your learning experience.
            </p>

            <div className="answers">
              {questions[step].options.map((option) => (
                <button
                  key={option}
                  className={`answer ${selected === option ? "selected" : ""}`}
                  onClick={() => setSelected(option)}
                >
                  <span className="radio-dot" />
                  {option}
                </button>
              ))}
            </div>

            <div className="actions">
              {step > 0 && (
                <button className="secondary" onClick={previousQuestion}>
                  Back
                </button>
              )}
              <button
                className="primary"
                disabled={!selected}
                onClick={nextQuestion}
              >
                {step === questions.length - 1 ? "Get Started" : "Continue"}
              </button>
            </div>
          </section>
        )}

        {page === "home" && (
          <section>
            <p className="eyebrow">YOUR FINANCIAL JOURNEY STARTS HERE</p>
            <h1>Finance made simple.</h1>
            <p className="subtitle">
              Learn, explore and understand investing with confidence.
              Choose where you'd like to begin.
            </p>

            <div className="feature-grid">
              {features.map((feature) => (
                <button
                  key={feature.number}
                  className="feature-card"
                  onClick={() => setPage(feature.page)}
                >
                  <span className="feature-number">{feature.number}</span>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <span className="feature-link">Explore →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === "learning" && (
          <section>
            <p className="eyebrow">BUILD YOUR KNOWLEDGE</p>
            <h1>My Learning Path</h1>
            <p className="subtitle">
              Explore the foundations of investing, one topic at a time.
            </p>

            <TableOfContents
              initialLevel={levelFromKnowledge(answers[0])}
              onNavigate={(target) => setPage(target as Page)}
            />
          </section>
        )}

        {page === "profile" && (
          <section>
            <p className="eyebrow">YOUR INVESTOR IDENTITY</p>
            <h1>My Investor Profile</h1>
            <p className="subtitle">
              A summary of the information you shared with us.
            </p>

            <div className="profile-list">
              {questions.map((question, index) => (
                <div className="profile-item" key={question.title}>
                  <p className="profile-question">{question.title}</p>
                  <strong>{answers[index] || "Not answered"}</strong>
                </div>
              ))}
            </div>

            <p className="disclaimer">
              This profile is educational and is not a formal investment
              suitability assessment.
            </p>
          </section>
        )}

        {page === "coach" && (
          <section>
            <p className="eyebrow">LEARN THROUGH CONVERSATION</p>
            <h1>AI Coach</h1>
            <p className="subtitle">
              Your space to ask questions about investing.
            </p>

            <div className="chat-box">
              <div className="coach-intro">
                <span className="coach-avatar">F.</span>
                <div>
                  <strong>Finance for idiots Coach</strong>
                  <p>Hi! What would you like to learn today?</p>
                </div>
              </div>

              {chatMessages.map((message, index) => (
                <div className="user-message" key={index}>
                  {message}
                </div>
              ))}
            </div>

            <form
              className="chat-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!chatInput.trim()) return;
                setChatMessages([...chatMessages, chatInput.trim()]);
                setChatInput("");
              }}
            >
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask me anything about investing..."
              />
              <button className="primary" type="submit">
                Send
              </button>
            </form>

            <p className="disclaimer">
              Demo interface only. AI responses will be connected through
              Amazon Bedrock.
            </p>
          </section>
        )}

        {page === "portfolio" && (
          <section>
            <p className="eyebrow">YOUR INVESTMENT OVERVIEW</p>
            <h1>My Portfolio</h1>
            <p className="subtitle">
              Understand your investments and how they behave.
            </p>

            <div className="portfolio-card">
              <span className="feature-number">PORTFOLIO OVERVIEW</span>
              <h2>Connect your investments</h2>
              <p>
                Soon, you'll be able to explore a demo portfolio,
                understand your asset allocation and simulate market scenarios.
              </p>
              <button className="primary" disabled>
                Coming soon
              </button>
            </div>

            <p className="disclaimer">
              Investment simulations are educational, not predictions
              or personalized financial advice.
            </p>
          </section>
        )}
      </main>

      <footer>
        <span>Finance for idiots</span>
        <span>Financial education made accessible.</span>
      </footer>
    </div>
  );
}

export default App;
