import { useEffect, useMemo, useState } from "react";
import "./App.css";
import TableOfContents from "../features/learning/TableOfContents";
import DemoPortfolio from "../features/portfolio/DemoPortfolio";
import { demoPortfolioForCoach, findDemoPortfolio, type DemoPortfolioData } from "../features/portfolio/demoPortfolioContext";
import { levelFromKnowledge } from "../features/learning/learningLevel";
import Coach from "../features/coach/Coach";
import { saveProfile } from "../features/coach/api";
import type { ChatMessage } from "../features/coach/api";
import { setCurrentPage } from "./pageContext";
import BabySteps from "../features/planning/BabySteps";
import MyPlan from "../features/planning/MyPlan";
import { formatDate, getSteps, markDemoConnected, nextThing, useBabySteps } from "../features/planning/babyStepsStore";
import {
  emptyProfile,
  estimatePreliminaryRisk,
  optionalQuestions,
  readPendingProfile,
  readUserProfile,
  requiredQuestions,
  savePendingProfile,
  saveUserProfile,
  type OnboardingProfile,
} from "../features/onboarding/onboarding";

type Page =
  | "onboarding"
  | "personalization"
  | "demo-selection"
  | "home"
  | "steps"
  | "plan"
  | "learning"
  | "profile"
  | "coach"
  | "portfolio";

const PAGE_NAMES: Record<Page, string> = {
  onboarding: "Onboarding quiz",
  personalization: "Optional personalization questions",
  "demo-selection": "Choose Demo Account",
  home: "Home",
  steps: "Baby Steps (guided path for beginners)",
  plan: "My Plan",
  learning: "My Learning Path",
  profile: "My Investor Profile",
  coach: "AI Coach",
  portfolio: "My Portfolio (demo portfolios)",
};

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
  onDemoClientSelected?: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  userId?: string | null;
};

function App({
  authenticated,
  showOnboarding = false,
  onQuizComplete,
  onDemoClientSelected,
  onLogout,
  onLogoClick,
  userId = null,
}: AppProps) {
  const storedProfile = showOnboarding
    ? readPendingProfile()
    : userId ? readUserProfile(userId) : null;
  const [page, setPage] = useState<Page>(
    showOnboarding ? "onboarding" : pageFromHash() ?? "home"
  );
  // the pretend National Bank client picked on the Portfolio page (demo), shared with the AI Coach
  const [profile, setProfile] = useState<OnboardingProfile>(storedProfile ?? emptyProfile());
  const [demoClient, setDemoClient] = useState<DemoPortfolioData | null>(() => findDemoPortfolio(storedProfile?.demoClientId));
  const [step, setStep] = useState(0);
  const answers = profile.requiredAnswers;
  const [selected, setSelected] = useState("");
  const [optionalStep, setOptionalStep] = useState(0);
  const [optionalSelected, setOptionalSelected] = useState("");
  const [optionalStarted, setOptionalStarted] = useState(false);
  const [personalizationReturn, setPersonalizationReturn] = useState<"demo-selection" | "profile">("demo-selection");
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
    if (!authenticated || !userId || answers.length < requiredQuestions.length) return;
    saveProfile(profile).catch((err) => console.warn("Could not save profile:", err));
  }, [answers.length, authenticated, profile, userId]);

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
    const updatedProfile = {
      ...profile,
      requiredAnswers: updated,
      preliminaryRisk: estimatePreliminaryRisk(updated),
      monthlyBudget: updated[5] ?? "",
    };
    setProfile(updatedProfile);
    savePendingProfile(updatedProfile);

    if (step === requiredQuestions.length - 1) {
      setPage("personalization");
    } else {
      setStep(step + 1);
      setSelected(updated[step + 1] || "");
    }
  }

  function saveOptionalAnswer() {
    if (!optionalSelected) return;
    const updatedAnswers = [...profile.optionalAnswers];
    updatedAnswers[optionalStep] = optionalSelected;
    const updatedProfile = { ...profile, optionalAnswers: updatedAnswers, optionalSkipped: false };
    setProfile(updatedProfile);

    if (optionalStep === optionalQuestions.length - 1) {
      if (userId) saveUserProfile(userId, updatedProfile); else savePendingProfile(updatedProfile);
      setPage(personalizationReturn);
      setOptionalStep(0);
      setOptionalSelected("");
    } else {
      setOptionalStep(optionalStep + 1);
      setOptionalSelected(updatedAnswers[optionalStep + 1] ?? "");
    }
  }

  function skipRemainingOptionalQuestions() {
    const updatedProfile = { ...profile, optionalSkipped: true };
    setProfile(updatedProfile);
    if (userId) saveUserProfile(userId, updatedProfile);
    else savePendingProfile(updatedProfile);
    setOptionalStarted(false);
    setOptionalStep(0);
    setOptionalSelected("");
    setPage(personalizationReturn);
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
          
          <span className="logo-icon">FD</span>
          <span>Finance For Dummies</span>
        </button>

        {authenticated && page !== "onboarding" && page !== "personalization" && (
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
              Question {step + 1} of {requiredQuestions.length}
            </div>
            <div className="progress">
              <div style={{ width: `${((step + 1) / requiredQuestions.length) * 100}%` }} />
            </div>

            <h1>{requiredQuestions[step].title}</h1>
            <p className="subtitle">
              Your answer will help us personalize your learning experience.
            </p>

            <div className="answers">
              {requiredQuestions[step].options.map((option) => (
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
                {step === requiredQuestions.length - 1 ? "Finish" : "Continue"}
              </button>
            </div>
          </section>
        )}

        {page === "personalization" && !optionalStarted && (
          <section className="onboarding personalization-choice">
            <p className="eyebrow">OPTIONAL PERSONALIZATION</p>
            <h1>Want a more personalized experience?</h1>
            <p className="subtitle">
              Answer 10 additional questions to help us understand your financial
              situation and personalize your experience.
            </p>
            <div className="actions personalization-actions">
              <button className="primary" onClick={() => setOptionalStarted(true)}>
                Personalize my experience
              </button>
              <button className="secondary" onClick={() => {
                const updated = { ...profile, optionalSkipped: true };
                setProfile(updated);
                if (userId) saveUserProfile(userId, updated); else savePendingProfile(updated);
                setPage(personalizationReturn);
              }}>
                Skip for now
              </button>
            </div>
          </section>
        )}

        {page === "personalization" && optionalStarted && (
          <section className="onboarding">
            <p className="eyebrow">OPTIONAL PERSONALIZATION</p>
            <div className="progress-label">
              <span>A little more about you</span>
              Question {optionalStep + 1} of {optionalQuestions.length}
            </div>
            <div className="progress">
              <div style={{ width: `${((optionalStep + 1) / optionalQuestions.length) * 100}%` }} />
            </div>
            <h1>{optionalQuestions[optionalStep].title}</h1>
            <p className="subtitle">Choose the answer that feels closest to your situation.</p>
            <div className="answers">
              {optionalQuestions[optionalStep].options.map((option) => (
                <button key={option} className={`answer ${optionalSelected === option ? "selected" : ""}`} onClick={() => setOptionalSelected(option)}>
                  <span className="radio-dot" />{option}
                </button>
              ))}
            </div>
            <div className="actions">
              {optionalStep > 0 && <button className="secondary" onClick={() => {
                const previous = optionalStep - 1;
                setOptionalStep(previous);
                setOptionalSelected(profile.optionalAnswers[previous] ?? "");
              }}>Back</button>}
              <button className="secondary" onClick={skipRemainingOptionalQuestions}>
                Skip the rest for now
              </button>
              <button className="primary" disabled={!optionalSelected} onClick={saveOptionalAnswer}>
                {optionalStep === optionalQuestions.length - 1 ? "Finish personalization" : "Continue"}
              </button>
            </div>
          </section>
        )}

        {page === "demo-selection" && (
          <section>
            <p className="eyebrow">CHOOSE YOUR DEMO EXPERIENCE</p>
            <h1>Pick a client portfolio.</h1>
            <p className="subtitle">
              Choose the hardcoded demo client whose investments you want to explore.
              This choice will stay attached to your account experience.
            </p>

            <DemoPortfolio
              selectionOnly
              onSelectClient={(portfolio) => {
                const updated = { ...profile, demoClientId: portfolio.id };
                setProfile(updated);
                savePendingProfile(updated);
                setDemoClient(portfolio);
                onQuizComplete();
                onDemoClientSelected?.();
              }}
            />
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
              {requiredQuestions.map((question, index) => (
                <div className="profile-item" key={question.title}>
                  <p className="profile-question">{question.title}</p>
                  <strong>{answers[index] || "Not answered"}</strong>
                </div>
              ))}
              <div className="profile-item risk-estimate">
                <p className="profile-question">Preliminary risk profile estimate</p>
                <strong>{profile.preliminaryRisk}</strong>
                <small>Based on both your reaction to a loss and your capacity to afford one. This is educational and is not professional financial advice.</small>
              </div>
            </div>

            <h2>Optional personalization</h2>
            {profile.optionalAnswers.length === optionalQuestions.length ? (
              <div className="profile-list">
                {optionalQuestions.map((question, index) => (
                  <div className="profile-item" key={question.title}>
                    <p className="profile-question">{question.title}</p>
                    <strong>{profile.optionalAnswers[index]}</strong>
                  </div>
                ))}
              </div>
            ) : <p className="subtitle">You can answer these questions whenever you're ready.</p>}
            <button className="primary" onClick={() => {
              setPersonalizationReturn("profile");
              setOptionalStarted(true);
              setOptionalStep(0);
              setOptionalSelected(profile.optionalAnswers[0] ?? "");
              setPage("personalization");
            }}>{profile.optionalAnswers.length ? "Update personalization" : "Personalize my experience"}</button>

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
              portfolio={demoClient ? demoPortfolioForCoach(demoClient) : undefined}
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
              initialClientId={profile.demoClientId}
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
        <span>Finance For Dummies</span>
        <span>Financial education made accessible.</span>
      </footer>
    </div>
  );
}

export default App;
