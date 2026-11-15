# Frontend source structure

- `app/` — dashboard shell, routing, and page context
- `auth/` — Cognito login, signup, and password recovery
- `landing/` — public landing page
- `features/coach/` — AI coach, floating phone, chat API, and source formatting
- `features/learning/` — lessons, topic slides, charts, and illustrations
- `features/planning/` — Baby Steps, plans, check-ins, and progress storage
- `features/portfolio/` — demo portfolios, insights, and the interactive chart
- `shared/` — reusable UI and visual helpers used by multiple features
- `data/` — static demo and learning datasets
- `assets/` — images bundled by Vite

The root of `src/` intentionally contains only the Vite entry point, global styles,
AWS configuration, and these top-level folders.
