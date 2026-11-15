
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import "./aws-config";
import "./index.css";
import "./App.css";
import App from "./App";
import AuthPage from "./auth/AuthPage";
import LandingPage from "./landing/LandingPage";

function Root() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  const [screen, setScreen] = useState<"landing" | "login" | "signup">(
    "landing"
  );

  const [quizComplete, setQuizComplete] = useState(
    () => sessionStorage.getItem("financeQuizAnswers") !== null
  );

  const [nbcComplete, setNbcComplete] = useState(
    () => sessionStorage.getItem("financeNbcChoice") !== null
  );

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
      setScreen("landing");

      sessionStorage.removeItem("financeQuizAnswers");
      setQuizComplete(false);

      sessionStorage.removeItem("financeNbcChoice");
      setNbcComplete(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  if (checking) {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  // Public homepage
  if (!authenticated && screen === "landing") {
    return (
      <LandingPage
        onLogin={() => setScreen("login")}
        onSignup={() => setScreen("signup")}
      />
    );
  }

  // Cognito login/signup
  if (!authenticated) {
    return (
      <AuthPage
          key={screen}
          initialMode={screen === "signup" ? "signup" : "login"}
          onHome={() => setScreen("landing")}
          onAuthenticated={() => {
            setAuthenticated(true);
          }}
        />
    );
  }

  // Quiz after authentication
  if (!quizComplete) {
    return (
      <App
        authenticated={authenticated}
        onQuizComplete={() => setQuizComplete(true)}
      />
    );
  }

  // National Bank or demo selection
  if (!nbcComplete) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">FI</span>
            <span>Finance for idiots</span>
          </div>
        </header>

        <main>
          <section className="onboarding">
            <p className="eyebrow">ONE LAST STEP</p>

            <h1>Connect your National Bank investment account</h1>

            <p className="subtitle">
              Would you like to connect your investments or explore
              Finance for idiots using a demo portfolio?
            </p>

            <div className="answers">
              <button
                className="answer"
                onClick={() => {
                  alert("National Bank account connection is coming soon.");
                }}
              >
                Connect my National Bank account
              </button>

              <button
                className="answer"
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
      <div style={{ textAlign: "right", padding: "12px 7%" }}>
        <button onClick={handleLogout}>Log out</button>
      </div>

      <App
        authenticated={authenticated}
        onQuizComplete={() => setQuizComplete(true)}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
