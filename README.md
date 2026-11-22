# FinStep — finance calculators that show their working

**Live app:** https://finstep-khaki.vercel.app · **Health check:** [/api/health](https://finstep-khaki.vercel.app/api/health)

**FinStep** is a free web app for FRM Part I and CFA Level I candidates. Each calculator returns the answer **and** the full worked solution: the reasoning in plain English, the formula, the numbers plugged in, and the exact **Texas Instruments BA II Plus keystrokes** to reproduce it in the exam room.

> Built for the Masters' Union *Ship It* course, using AI (Claude) throughout the development process.

## Who it's for

Candidates preparing for FRM Part I / CFA Level I. They already have formula sheets; what they lack is a fast way to **check a practice question step by step** and learn the calculator key sequence, without opening a textbook solution manual.

## Core task (for evaluators)

1. Open `/calculators/bond-price-yield`.
2. Keep the defaults (face 1,000, 6% coupon, 5 years, semiannual, YTM 8%).
3. **Expected result:** price **918.89**, with 6 numbered working steps, a BA II Plus panel (`10 N`, `4 I/Y`, `30 PMT`, `1000 FV`, `CPT PV` → −918.89) and exam takeaways.
4. Switch "What do you want to find?" to *Yield to maturity*, enter price `918.89` → YTM **8.0000%**.
5. Click **Share link** and open it in a new tab: the same inputs and answer load from the URL.

## Features

- **8 calculators**: bond price & YTM · duration, convexity & DV01 · compounding converter · spot → forward rates & par yields · forward/futures price (cost of carry + arbitrage check) · Black-Scholes-Merton & Greeks · VaR & expected shortfall (single asset and two-asset diversification) · Sharpe / Treynor / Jensen / M² / information / Sortino.
- **Step-by-step working** rendered with KaTeX, logic first, then formula, then substitution.
- **BA II Plus keystrokes** for every time-value problem.
- **Shareable state**: every input is stored in the URL.
- **Robust input handling**: accepts `1,000` and `6%`, inline validation messages, cross-field checks (e.g. fractional coupon periods), and the calculators never throw on bad input (fuzz-tested).
- **8 long-form study guides**, a printable formula sheet, FAQ and JSON-LD structured data for SEO.
- **Feedback form** and an anonymous "problems solved" counter backed by Postgres.
- **Pro PDF** checkout via Dodo Payments with a signed webhook that records payments.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, Geist font (self-hosted), KaTeX |
| Database | Postgres on Neon (`@neondatabase/serverless` HTTP driver) |
| Validation | Zod |
| Payments | Dodo Payments checkout link + Standard Webhooks signature verification |
| Analytics | Microsoft Clarity (env-gated) |
| Hosting | Vercel |
| Tests / CI | Vitest (41 tests) · GitHub Actions: lint → typecheck → test → build |

## Architecture

```
src/
├── lib/finance/            Pure calculation engine (no React, no I/O)
│   ├── calculators/*.ts    One file per calculator: fields, presets, formulas, compute()
│   ├── registry.ts         runCalculator(): validate → compute → never throws
│   ├── inputs.ts           Parsing & validation of raw text inputs
│   ├── math.ts             Normal CDF/inverse (double precision), bisection solver
│   └── finance.test.ts     Textbook cases (Hull BSM, duration, VaR…) + fuzzing
├── components/calculator/  Schema-driven form, results, steps, keystrokes, tables
├── app/
│   ├── calculators/[slug]  Statically generated calculator pages + OG images
│   ├── blog/[slug]         Statically generated study guides
│   ├── api/                usage · stats · feedback · health · webhooks/dodo
│   ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
│   └── not-found / error / global-error boundaries
├── proxy.ts                Real 404s for unknown slugs on streamed routes
└── lib/db.ts               Lazy Neon client; tables auto-created (see db/schema.sql)
```

Design decisions:

- **The engine is pure and shared.** Calculators run in the browser (instant feedback, no server cost, inputs never leave the device). The same code is unit-tested in Node.
- **Every page is static.** Calculator and blog pages are prerendered; only the API routes run on demand.
- **Graceful degradation.** With no `DATABASE_URL`, the feedback form explains that storage is unavailable and the counter hides itself. With no Clarity ID or checkout URL, those features switch off cleanly.
- **API hardening.** Zod validation, body-size caps, same-origin checks, per-IP rate limits, a honeypot field, parameterised SQL, idempotent webhook inserts, and security headers (HSTS, X-Frame-Options, nosniff, Permissions-Policy).

## Running locally

```bash
npm install
cp .env.example .env.local   # all values optional
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests
npm run build && npm start   # production build
```

## Environment variables

See [`.env.example`](./.env.example). All are optional.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and OG images |
| `DATABASE_URL` | Neon Postgres (set automatically by Vercel's Neon integration) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity tracking |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag verification |
| `NEXT_PUBLIC_DODO_CHECKOUT_URL`, `NEXT_PUBLIC_PRO_PRICE_LABEL`, `DODO_WEBHOOK_SECRET` | Pro PDF checkout and payment webhook |

## Deployment

1. Import the repository in Vercel (framework preset: Next.js).
2. Storage → add a **Neon** Postgres database (injects `DATABASE_URL`).
3. Set `NEXT_PUBLIC_SITE_URL` to the custom domain and add the domain under Settings → Domains.
4. Optional: add the Clarity, Search Console and Dodo variables, then redeploy.

Health check: `GET /api/health` → `{"status":"ok","database":"ok"}`.

## Accuracy

Results are checked in tests against published examples — e.g. Hull's Black-Scholes example (S=42, K=40, T=0.5, r=10%, σ=20% → c=4.76, p=0.81), the 3-year 10% bond (Macaulay duration 2.7355, convexity 8.7562), and 99% 10-day VaR on a 1m position with 1% daily volatility (73,565.58).

FinStep is a study aid, not investment advice. FRM® and CFA® are trademarks of GARP and CFA Institute, which do not endorse this project.
