
import "./LandingPage.css";

type LandingPageProps = {
  onLogin: () => void;
  onSignup: () => void;
};

export default function LandingPage({
  onLogin,
  onSignup,
}: LandingPageProps) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-logo">FI</div>
          <span>Finance for idiots</span>
        </div>

        <nav className="landing-links">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing-auth">
          <button className="landing-login" onClick={onLogin}>
            Log in
          </button>
          <button className="landing-signup" onClick={onSignup}>
            Sign up
          </button>
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
              <button className="landing-primary" onClick={onSignup}>
                Get started →
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
            they're common knowledge. We built Finance for idiots to make
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
            Answer five quick questions about your experience and goals.
            From there, explore lessons, ask questions, and get a better
            understanding of investing at your own pace.
        </p>

        <button className="landing-primary" onClick={onSignup}>
            Get started →
        </button>
        </section>
      </main>
    </div>
  );
}
