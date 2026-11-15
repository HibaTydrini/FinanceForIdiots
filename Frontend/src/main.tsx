import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import "./aws-config";
import "./index.css";
import "./App.css";
import App from "./App";
import AuthPage from "./auth/AuthPage";
import LandingPage from "./landing/LandingPage";
import AIPhone from "./AIPhone";
import { resetBabySteps } from "./babyStepsStore";

type Screen = "landing" | "login" | "signup" | "dashboard";

function getScreen(): Screen {
  const value = window.location.hash.slice(1).split("/")[0];

  if (
    value === "login" ||
    value === "signup" ||
    value === "dashboard"
  ) {
    return value;
  }

  return "landing";
}

// The app's entry file: it renders Root and exports nothing, so fast refresh doesn't apply here.
// eslint-disable-next-line react-refresh/only-export-components
function Root() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [signupQuestions, setSignupQuestions] = useState(false);

  const [screen, setScreen] = useState<Screen>(getScreen);

  const [quizComplete, setQuizComplete] = useState(
    () => localStorage.getItem("financeQuizAnswers") !== null
  );

  const [nbcComplete, setNbcComplete] = useState(true);

  useEffect(() => {
    const handleNavigation = () => setScreen(getScreen());

    window.addEventListener("hashchange", handleNavigation);

    return () => {
      window.removeEventListener("hashchange", handleNavigation);
    };
  }, []);

  function navigate(target: Screen) {
    window.location.hash =
      target === "dashboard" ? "dashboard/home" : target;

    setScreen(target);
  }

  useEffect(() => {
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    try {
      await signOut();

      setAuthenticated(false);
      setSignupQuestions(false);
      setQuizComplete(
        localStorage.getItem("financeQuizAnswers") !== null
      );

      sessionStorage.removeItem("financeNbcChoice");
      setNbcComplete(true);

      navigate("landing");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  function handleAuthenticated(method: "login" | "signup") {
    setAuthenticated(true);

    if (method === "signup") {
      localStorage.removeItem("financeQuizAnswers");
      resetBabySteps(); // a new account starts Baby Steps from step 1
      setSignupQuestions(true);
      setQuizComplete(false);
    } else {
      setSignupQuestions(false);
      setQuizComplete(true);
    }

    setNbcComplete(true);
    navigate("dashboard");
  }

  if (checking) {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  // Public homepage
  if (screen === "landing") {
    return (
      <LandingPage
        onLogin={() => navigate("login")}
        onSignup={() => navigate("signup")}
      />
    );
  }

  // Cognito login and signup
  if (!authenticated) {
    return (
      <AuthPage
        key={screen}
        initialMode={screen === "signup" ? "signup" : "login"}
        onHome={() => navigate("landing")}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // Investment questions only after signup
  if (signupQuestions && !quizComplete) {
    return (
      <App
        authenticated={authenticated}
        showOnboarding={true}
        onQuizComplete={() => {
          setQuizComplete(true);
          setSignupQuestions(false);
          // New users start on the guided path instead of the home page.
          window.location.hash = "dashboard/steps";
        }}
        onLogout={handleLogout}
        onLogoClick={() => navigate("landing")}
      />
    );
  }

  // National Bank or demo selection
  if (!nbcComplete) {
    return (
      <div className="nbc-page">
        <header className="nbc-header">
          <div className="nbc-brand" onClick={handleLogout}>
            <span className="nbc-logo">FI</span>
            <span>Finance for idiots</span>
          </div>
        </header>

        <main className="nbc-main">
          <section className="nbc-card">
            <p className="nbc-eyebrow">ONE LAST STEP</p>

            <h1>Connect your National Bank investment account</h1>

            <p className="nbc-description">
              Would you like to connect your investments or explore
              Finance for idiots using a demo portfolio?
            </p>

            <div className="nbc-actions">
              <button
                className="nbc-primary"
                onClick={() => {
                  alert(
                    "National Bank account connection is coming soon."
                  );
                }}
              >
                Connect my National Bank account
              </button>

              <button
                className="nbc-secondary"
                onClick={() => {
                  sessionStorage.setItem("financeNbcChoice", "demo");
                  setNbcComplete(true);
                }}
              >
                Continue with a demo portfolio
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Dashboard
  return (
    <>
      <App
        authenticated={authenticated}
      showOnboarding={false}
        onQuizComplete={() => setQuizComplete(true)}
        onLogout={handleLogout}
        onLogoClick={() => navigate("landing")}
      />
      <AIPhone />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
