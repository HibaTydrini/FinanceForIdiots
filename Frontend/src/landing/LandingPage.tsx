
import "./LandingPage.css";

type LandingPageProps = {
  authenticated: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onDashboard: () => void;
};

export default function LandingPage({
  authenticated,
  onLogin,
  onSignup,
  onDashboard,
}: LandingPageProps) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-logo">FD</div>
          <span>Finance For Dummies</span>
        </div>

        <nav className="landing-links">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing-auth">
          {authenticated ? (
            <button className="landing-signup" onClick={onDashboard}>
              Go to dashboard
            </button>
          ) : (
            <>
              <button className="landing-login" onClick={onLogin}>Log in</button>
              <button className="landing-signup" onClick={onSignup}>Sign up</button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-text">
            <h1>
              Money talks.
              <span>Let's translate.</span>
            </h1>

            <p>
                Investing shouldn't feel like trying to understand
                a language nobody taught you.
            </p>

            <div className="landing-buttons">
              <button className="landing-primary" onClick={authenticated ? onDashboard : onSignup}>
                {authenticated ? "Go to dashboard →" : "Get started →"}
              </button>
              <a className="landing-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
          </div>

          <div className="landing-chart">
            <img
              src="/finance-chart.png"
              alt="Stock market candlestick chart"
            />
          </div>
        </section>

        <section className="landing-about" id="about">
          <span className="landing-eyebrow">ABOUT US</span>
          <h2>Because apparently, we're supposed to just know this stuff.</h2>
          <p>
            Stocks, ETFs, risk tolerance… everyone talks about them like
            they're common knowledge. We built Finance For Dummies to make
            investing easier to understand, whether you're completely new
            or already getting started.
          </p>
        </section>

        <section className="landing-how" id="how-it-works">
        <span className="landing-eyebrow">HOW IT WORKS</span>

        <h2>Your money. Your starting point.</h2>

        <p>
            Whether you've never invested a dollar or already have a
            portfolio, we'll help you find your way around the
            financial world.
        </p>

        <p>
            Answer seven quick questions about your experience and goals,
            then choose whether to add the optional personalization questions.
            From there, explore lessons, ask questions, and get a better
            understanding of investing at your own pace.
        </p>

        <button className="landing-primary" onClick={authenticated ? onDashboard : onSignup}>
            {authenticated ? "Go to dashboard →" : "Get started →"}
        </button>
        </section>
      </main>
    </div>
  );
}
