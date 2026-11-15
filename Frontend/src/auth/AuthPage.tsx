
import { useState } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import "./AuthPage.css";

type Mode = "login" | "signup" | "verify" | "forgot" | "reset";

type Props = {
  onAuthenticated: () => void;
  initialMode: "login" | "signup";
  onHome: () => void;
};

export default function AuthPage({
  onAuthenticated,
  initialMode,
  onHome,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function changeMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
    setCode("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const username = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        const result = await signUp({
          username,
          password,
          options: {
            userAttributes: {
              email: username,
              birthdate,
              name: fullName.trim(),
            },
          },
        });

        if (result.isSignUpComplete) {
          changeMode("login");
          setNotice("Account created! You can now log in.");
        } else {
          changeMode("verify");
          setNotice("Check your email for your verification code.");
        }
      }

      if (mode === "verify") {
        await confirmSignUp({
          username,
          confirmationCode: code.trim(),
        });

        changeMode("login");
        setNotice("Email verified! Please log in.");
      }

      if (mode === "login") {
        const result = await signIn({
          username,
          password,
        });

        if (result.isSignedIn) {
          onAuthenticated();
        } else if (
          result.nextStep.signInStep === "CONFIRM_SIGN_UP"
        ) {
          changeMode("verify");
          setNotice("Please verify your email first.");
        } else {
          setError(
            "Additional sign-in verification is required. " +
            "Please check your Cognito settings."
          );
        }
      }

      if (mode === "forgot") {
        await resetPassword({ username });
        changeMode("reset");
        setNotice("Check your email for a password reset code.");
      }

      if (mode === "reset") {
        await confirmResetPassword({
          username,
          confirmationCode: code.trim(),
          newPassword,
        });

        changeMode("login");
        setNotice("Password updated. You can now log in.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setNotice("");

    try {
      await resendSignUpCode({
        username: email.trim().toLowerCase(),
      });

      setNotice("A new verification code has been sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend code."
      );
    }
  }

  const titles: Record<Mode, string> = {
    login: "Welcome back",
    signup: "Create your account",
    verify: "Verify your email",
    forgot: "Forgot your password?",
    reset: "Set a new password",
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <button
          type="button"
          onClick={onHome}
          className="auth-home-button"
        >
          <span className="auth-logo">FI</span>
          <strong>Finance for idiots</strong>
        </button>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <p className="auth-eyebrow">YOUR FINANCIAL JOURNEY</p>
          <h1>{titles[mode]}</h1>

          <p className="auth-description">
            {mode === "signup"
              ? "Start learning about investing at your own pace."
              : mode === "login"
                ? "Log in to continue your financial education."
                : mode === "verify"
                  ? "Enter the code sent to your email address."
                  : mode === "forgot"
                    ? "We'll send you a code to reset your password."
                    : "Enter your verification code and new password."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <>
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={mode === "verify" || mode === "reset"}
            />

            {(mode === "login" || mode === "signup") && (
              <>
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  required
                />
              </>
            )}

            {mode === "signup" && (
              <>
                <label htmlFor="auth-birthdate">Date of birth</label>
                <input
                  id="auth-birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
                <p className="auth-hint">
                  Your age helps personalize educational content.
                </p>
              </>
            )}

            {(mode === "verify" || mode === "reset") && (
              <>
                <label htmlFor="auth-code">Verification code</label>
                <input
                  id="auth-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code"
                  autoComplete="one-time-code"
                  required
                />
              </>
            )}

            {mode === "reset" && (
              <>
                <label htmlFor="auth-new-password">
                  New password
                </label>
                <input
                  id="auth-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {notice && (
              <p className="auth-notice">{notice}</p>
            )}

            <button className="auth-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "verify"
                      ? "Verify email"
                      : mode === "forgot"
                        ? "Send reset code"
                        : "Reset password"}
            </button>
          </form>

          {mode === "verify" && (
            <button
              type="button"
              className="auth-link"
              onClick={resendCode}
            >
              Resend verification code
            </button>
          )}

          {mode === "login" && (
            <>
              <button
                type="button"
                className="auth-link"
                onClick={() => changeMode("forgot")}
              >
                Forgot password?
              </button>

              <p className="auth-switch">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("signup")}
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => changeMode("login")}
              >
                Log in
              </button>
            </p>
          )}

          {(mode === "forgot" ||
            mode === "reset" ||
            mode === "verify") && (
            <button
              type="button"
              className="auth-link"
              onClick={() => changeMode("login")}
            >
              Back to login
            </button>
          )}
        </div>
      </main>

      <footer className="auth-footer">
        Finance for idiots · Financial education made accessible.
      </footer>
    </div>
  );
}
