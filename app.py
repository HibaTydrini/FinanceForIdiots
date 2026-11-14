"""
FinanceForIdiots: app entry point.

Run locally:
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python app.py           # then open http://127.0.0.1:5001

Each feature lives in its own blueprint. Teammates: register yours below.
"""

import os

from flask import Flask, redirect, url_for

from toc import toc_bp


def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")
    app.register_blueprint(toc_bp)

    @app.route("/")
    def home():
        # Teammates: point this at the questionnaire once it's merged.
        return redirect(url_for("toc.index"))

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # 5000 is taken by AirPlay on macOS
