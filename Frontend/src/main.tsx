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

function Root() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

type Screen = "landing" | "login" | "signup" | "dashboard";

const getScreen = (): Screen => {
  const value = window.location.hash.slice(1).split("/")[0];

  if (value === "login" || value === "signup" || value === "dashboard") {
    return value;
  }

  return "landing";
};

const [screen, setScreen] = useState<Screen>(getScreen);

useEffect(() => {
  const handleNavigation = () => setScreen(getScreen());

  window.addEventListener("hashchange", handleNavigation);

  return () => window.removeEventListener("hashchange", handleNavigation);
}, []);

function navigate(screen: Screen) {
  window.location.hash = screen === "dashboard" ? "dashboard/home" : screen;
  setScreen(screen);
}



  const [quizComplete, setQuizComplete] = useState(
    () => localStorage.getItem("financeQuizAnswers") !== null
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
      navigate("landing");

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
  if (screen === "landing") {    return (
      <LandingPage
        onLogin={() => navigate("login")}
        onSignup={() => navigate("signup")}
      />
    );
  }

  // Cognito login/signup
  if (!authenticated) {
    return (
      <AuthPage
        key={screen}
        initialMode={screen === "signup" ? "signup" : "login"}
        onHome={() => navigate("landing")}
        onAuthenticated={() => {
          setAuthenticated(true);
          setQuizComplete(true);
          setNbcComplete(true);
          navigate("dashboard");
        }}
      />
    );
  }

  // Quiz after authentication
  if (!quizComplete ) {
    return (
      <App
        authenticated={authenticated}
        onQuizComplete={() => setQuizComplete(true)}
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
          <div
            className="nbc-brand"
            onClick={handleLogout}
          >
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
                  alert("National Bank account connection is coming soon.");
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
