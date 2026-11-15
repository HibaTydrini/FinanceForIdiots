import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import "./aws-config";
import "./index.css";
import "./app/App.css";
import App from "./app/App";
import AuthPage from "./auth/AuthPage";
import LandingPage from "./landing/LandingPage";
import AIPhone from "./features/coach/AIPhone";
import { resetBabySteps } from "./features/planning/babyStepsStore";
import { claimPendingProfile, clearPendingProfile, emptyProfile, readPendingProfile, savePendingProfile, setActiveUser } from "./features/onboarding/onboarding";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [signupQuestions, setSignupQuestions] = useState(
    () => getScreen() === "signup" && sessionStorage.getItem("ffd:signup-auth-ready") !== "yes"
  );

  const [screen, setScreen] = useState<Screen>(getScreen);

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

  function startSignup() {
    clearPendingProfile();
    sessionStorage.removeItem("ffd:signup-auth-ready");
    const signupFlowId = crypto.randomUUID();
    sessionStorage.setItem("ffd:signup-flow", signupFlowId);
    savePendingProfile({ ...emptyProfile(), signupFlowId });
    resetBabySteps();
    setSignupQuestions(true);
    navigate("signup");
  }

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setAuthenticated(true);
        setUserId(user.userId);
        setActiveUser(user.userId);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    try {
      await signOut();

      setAuthenticated(false);
      setUserId(null);
      setActiveUser(null);
      setSignupQuestions(false);
      sessionStorage.removeItem("financeNbcChoice");
      sessionStorage.removeItem("ffd:signup-flow");
      setNbcComplete(true);

      navigate("landing");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  async function handleAuthenticated(method: "login" | "signup") {
    const user = await getCurrentUser();
    setUserId(user.userId);
    setActiveUser(user.userId);
    const pending = readPendingProfile();
    const signupFlowId = sessionStorage.getItem("ffd:signup-flow");
    if (method === "signup" || (signupFlowId && pending?.signupFlowId === signupFlowId)) {
      claimPendingProfile(user.userId);
    }
    sessionStorage.removeItem("ffd:signup-flow");
    sessionStorage.removeItem("ffd:signup-auth-ready");
    setAuthenticated(true);

    setSignupQuestions(false);

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
        authenticated={authenticated}
        onLogin={() => navigate("login")}
        onSignup={startSignup}
        onDashboard={() => navigate("dashboard")}
      />
    );
  }

  // Show investment questions before account registration
  if (screen === "signup" && signupQuestions) {
    return (
      <App
        authenticated={false}
        showOnboarding={true}
        onQuizComplete={() => {}}
        onDemoClientSelected={() => {
          sessionStorage.setItem("ffd:signup-auth-ready", "yes");
          setSignupQuestions(false);
        }}
        onLogout={handleLogout}
        onLogoClick={() => navigate("landing")}
        userId={null}
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
        onStartSignup={startSignup}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // National Bank or demo selection
  if (!nbcComplete) {
    return (
      <div className="nbc-page">
        <header className="nbc-header">
          <div className="nbc-brand" onClick={handleLogout}>
            <span className="nbc-logo">FD</span>
            <span>Finance For Dummies</span>
          </div>
        </header>

        <main className="nbc-main">
          <section className="nbc-card">
            <p className="nbc-eyebrow">ONE LAST STEP</p>

            <h1>Connect your National Bank investment account</h1>

            <p className="nbc-description">
              Would you like to connect your investments or explore
              Finance For Dummies using a demo portfolio?
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
        onQuizComplete={() => {}}
        onLogout={handleLogout}
        onLogoClick={() => navigate("landing")}
        userId={userId}
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
