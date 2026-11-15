import { useEffect, useMemo, useState } from "react";
import "./App.css";
import TableOfContents from "./TableOfContents";
import DemoPortfolio from "./DemoPortfolio";
import type { DemoPortfolioData } from "./DemoPortfolio";
import { levelFromKnowledge } from "./learningLevel";
import Coach from "./Coach";
import { saveProfile } from "./api";
import type { ChatMessage } from "./api";
import { setCurrentPage } from "./pageContext";
import BabySteps from "./BabySteps";
import MyPlan from "./MyPlan";
import NewsFeed from "./NewsFeed";
import { formatDate, getSteps, markDemoConnected, nextThing, useBabySteps } from "./babyStepsStore";

// What the AI Coach is told about the demo client picked on the Portfolio page.
function portfolioForCoach(p: DemoPortfolioData) {
  return {
    name: p.name,
    account: p.account,
    risk: p.risk,
    horizon: p.horizon,
    goal: p.goal,
    valueCad: p.totals.valueCad,
    investedCad: p.totals.investedCad,
    gainPct: p.totals.gainPct,
    worstDropPct: p.totals.worstDropPct,
    holdings: p.holdings.map((h) => ({
      ticker: h.ticker,
      name: h.name,
      type: h.assetClass,
      sector: h.sector,
      weightPct: h.weightPct,
      gainPct: h.gainPct,
    })),
  };
}

type Page = "onboarding" | "home" | "steps" | "plan" | "learning" | "profile" | "coach" | "portfolio";

// Page names as the AI Phone describes them to the coach.
const PAGE_NAMES: Record<Page, string> = {
  onboarding: "Onboarding quiz",
  home: "Home",
  steps: "Baby Steps (guided path for beginners)",
  plan: "My Plan",
  learning: "My Learning Path",
  profile: "My Investor Profile",
  coach: "AI Coach",
  portfolio: "My Portfolio (demo portfolios)",
};


const questions = [
  {
    title: "What is your investment knowledge?",
    options: [
      "I'm completely new to investing",
      "I know a little about investing",
      "I understand the basics",
      "I'm experienced with investing",
    ],
  },
  {
    title: "What have you invested in?",
    options: [
      "I haven't invested yet",
      "Stocks",
      "ETFs or mutual funds",
      "Cryptocurrency",
      "Bonds or GICs",
      "A mix of different investments",
    ],
  },
  {
    title: "Why do you want to invest? What are your specific goals?",
    options: [
      "Grow my wealth over time",
      "Save for a house or major purchase",
      "Prepare for retirement",
      "Generate passive income",
      "I'm still figuring out my goals",
    ],
  },
  {
    title: "What is your risk tolerance?",
    options: [
      "Low — I prefer stability",
      "Moderate — I'm comfortable with some risk",
      "High — I can handle significant market changes",
      "I'm not sure yet",
    ],
  },
  {
    title: "What are you looking for from Finance for idiots?",
    options: [
      "Learn how investing works",
      "Understand my investments",
      "Get personalized financial education",
      "Understand investment risks",
      "All of the above",
    ],
  },
];


const features = [
  {
    number: "01",
    title: "Baby Steps",
    description: "New to investing? Follow a guided path, one small step at a time.",
    page: "steps" as Page,
  },
  {
    number: "02",
    title: "My Plan",
    description: "Your goal, your monthly habit and what to do next.",
    page: "plan" as Page,
  },
  {
    number: "03",
    title: "My Learning Path",
    description: "Learn investing step by step, at your own pace.",
    page: "learning" as Page,
  },
  {
    number: "04",
    title: "My Investor Profile",
    description: "Explore your goals, knowledge and comfort with risk.",
    page: "profile" as Page,
  },
  {
    number: "05",
    title: "AI Coach",
    description: "Get explanations and answers to your finance questions.",
    page: "coach" as Page,
  },
  {
    number: "06",
    title: "My Portfolio",
    description: "Understand your investments and explore scenarios.",
    page: "portfolio" as Page,
  },
];


// The dashboard page named in the address, e.g. "#dashboard/steps".
function pageFromHash(): Page | null {
  const target = window.location.hash.split("/")[1];

  if (
    target === "home" ||
    target === "steps" ||
    target === "plan" ||
    target === "learning" ||
    target === "profile" ||
    target === "coach" ||
    target === "portfolio"
  ) {
    return target;
  }

  return null;
}

type AppProps = {
  authenticated: boolean;
  showOnboarding?: boolean;
  onQuizComplete: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
};

function App({
  authenticated,
  showOnboarding = false,
  onQuizComplete,
  onLogout,
  onLogoClick,
}: AppProps) {
  const [page, setPage] = useState<Page>(
    showOnboarding ? "onboarding" : pageFromHash() ?? "home"
  );
  // the pretend National Bank client picked on the Portfolio page (demo), shared with the AI Coach
  const [demoClient, setDemoClient] = useState<DemoPortfolioData | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => {
  const saved = localStorage.getItem("financeQuizAnswers");

  try {
    return saved ? JSON.parse(saved) as string[] : [];
  } catch {
    return [];
  }
  });
  const [selected, setSelected] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // a question filled in for the AI Coach by a Baby Steps "Ask the AI Coach" button
  const [coachQuestion, setCoachQuestion] = useState("");
  const { state: babySteps } = useBabySteps();
  const babyStepList = useMemo(() => getSteps(answers), [answers]);
  const next = nextThing(babySteps, babyStepList);

  useEffect(() => {
    const handleNavigation = () => {
      if (showOnboarding) return;

      const target = pageFromHash();

      if (target) {
        setPage(target);
        if (target !== "coach") setCoachQuestion("");
      }
    };

    handleNavigation();

    window.addEventListener("hashchange", handleNavigation);

    return () => {
      window.removeEventListener("hashchange", handleNavigation);
    };
  }, [showOnboarding]);

  // Send the quiz answers to the backend so the AI Coach can personalize its answers.
  // Runs after the quiz and on every visit, so profiles from before the backend existed are sent too.
  // The site still works if the backend is down; the coach just won't know the profile.
  useEffect(() => {
    if (answers.length < questions.length) return;
    saveProfile(answers).catch((err) => console.warn("Could not save profile:", err));
  }, [answers]);

  // Tell the AI Phone which page is open (pageContext.ts).
  useEffect(() => {
    setCurrentPage(PAGE_NAMES[page]);
  }, [page]);

function navigatePage(target: Page) {
  window.location.hash = `dashboard/${target}`;
  setPage(target);
  if (target !== "coach") setCoachQuestion("");
}

  // Opens the AI Coach with a question already typed in.
  function askCoach(question: string) {
    setCoachQuestion(question);
    window.location.hash = "dashboard/coach";
    setPage("coach");
  }

  function nextQuestion() {
    if (!selected) return;

    const updated = [...answers];
    updated[step] = selected;
    setAnswers(updated);

    if (step === questions.length - 1) {
      localStorage.setItem("financeQuizAnswers", JSON.stringify(updated));

      onQuizComplete();
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
        <button className="logo" onClick={onLogoClick}>
          
          <span className="logo-icon">FI</span>
          <span>Finance for idiots</span>
        </button>

        {authenticated && page !== "onboarding" && (
          <nav>
            <button onClick={() => navigatePage("home")}>Home</button>
            <button onClick={() => navigatePage("steps")}>Baby Steps</button>
            <button onClick={() => navigatePage("plan")}>My Plan</button>
            <button onClick={() => navigatePage("learning")}>Learn</button>
            <button onClick={() => navigatePage("profile")}>Profile</button>
            <button onClick={() => navigatePage("coach")}>AI Coach</button>
            <button onClick={() => navigatePage("portfolio")}>Portfolio</button>
            <button className="logout-button" onClick={onLogout}>Log out</button>
          </nav>
        )}
      </header>

      <main>
        {page === "onboarding" && (
          <section className="onboarding">
            <p className="eyebrow">LET'S GET TO KNOW YOU</p>
            <div className="progress-label">
              <span>Your investor journey</span>
              Question {step + 1} of {questions.length}
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
                {step === questions.length - 1 ? "Finish" : "Continue"}
              </button>
            </div>
          </section>
        )}

        {page === "home" && (
          <section>
            <div className="next-step-card">
              <p className="eyebrow">YOUR NEXT STEP</p>
              {next.kind === "step" ? (
                <>
                  <h2>
                    Baby Step {next.number} of {next.total}: {next.step.title}
                  </h2>
                  <p>{next.action}</p>
                  <button className="primary" onClick={() => navigatePage("steps")}>
                    {babySteps.completedSteps.length === 0 && !babySteps.checks[next.step.id]
                      ? "Start"
                      : "Continue"}{" "}
                    →
                  </button>
                </>
              ) : (
                <>
                  <h2>
                    Your next check-in{next.date ? `: ${formatDate(next.date)}` : ""}
                  </h2>
                  <p>You finished Baby Steps. A 30-second check-in each month keeps your plan on track.</p>
                  <button className="primary" onClick={() => navigatePage("plan")}>
                    Go to my check-in →
                  </button>
                </>
              )}
            </div>

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
                  onClick={() => navigatePage(feature.page)}
                >
                  <span className="feature-number">{feature.number}</span>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <span className="feature-link">Explore →</span>
                </button>
              ))}
            </div>

            <NewsFeed />
          </section>
        )}

        {page === "steps" && (
          <section>
            <p className="eyebrow">ONE SMALL STEP AT A TIME</p>
            <h1>Baby Steps</h1>
            <p className="subtitle">
              A guided path from your first lesson to a simple long-term
              investing plan. Learn it, check it, then do it.
            </p>

            <BabySteps
              answers={answers}
              onNavigate={(target) => navigatePage(target as Page)}
              onAskCoach={askCoach}
            />
          </section>
        )}

        {page === "plan" && (
          <section>
            <p className="eyebrow">YOUR LONG-TERM PLAN</p>
            <h1>My Plan</h1>
            <p className="subtitle">
              What you decided in Baby Steps, and what to do next.
            </p>

            <MyPlan
              answers={answers}
              onNavigate={(target) => navigatePage(target as Page)}
            />
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
              onNavigate={(target) => navigatePage(target as Page)}
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

            <Coach
              key={coachQuestion}
              initialQuestion={coachQuestion}
              messages={chatMessages}
              setMessages={setChatMessages}
              intro={
                demoClient
                  ? `Hi ${demoClient.name}! I can see your demo ${demoClient.account} portfolio. Ask me anything about it, like "Am I too concentrated?"`
                  : undefined
              }
              portfolio={demoClient ? portfolioForCoach(demoClient) : undefined}
            />

            <p className="disclaimer">
              Educational answers based on National Bank of Canada content,
              generated by AI through Amazon Bedrock. Not personalized
              financial advice. AI can make mistakes; check the linked sources.
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

            <DemoPortfolio
              onConnect={markDemoConnected}
              onAskCoach={(portfolio) => {
                setDemoClient(portfolio);
                setPage("coach");
              }}
            />

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
