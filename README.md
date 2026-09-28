# BTC Regime Dashboard

Static React/Lightweight Charts dashboard, preserving the existing Vercel-compatible HTML distribution.

## Run locally

`python3 -m http.server 4173 --bind 127.0.0.1`

Open http://127.0.0.1:4173. Serve over HTTP, because the page imports `decision.mjs`.

## Files

- `index.html`: original bundled libraries, chart components, and readable main dashboard component.
- `enhancements.css`: compact responsive layout and position-specific action panel.
- `decision.mjs`: mutually exclusive scenario classification and numeric input validation.
- `tests/decision.test.mjs`: decision boundaries, unavailable data, and input validation.

Run checks with `node --test tests/decision.test.mjs`.

## Data and interpretation

The supplied repository contains no `/api/btc` implementation or original React build project. The existing request sequence is retained: same-origin `/api/btc`, then public Binance endpoints. Public endpoint access depends on network, regional availability and rate limits. The stored snapshot is explicitly marked while current data is unavailable. The action panel waits for both current and historical data; failed refreshes suspend its signal.

Current-price comparisons include an unfinished candle and do not establish a confirmed daily-close break. Historical chart peaks are hindsight labels, not executable sell signals. This change clarifies those distinctions; it does not revalidate the historical strategy, externally supplied event notes, or all existing analytics.

Deploy `index.html`, `decision.mjs`, and `enhancements.css` together. No new build dependencies are required.

## Overheating indicators

`data/overheating.mjs` contains the user-supplied daily records for 2026-09-01 through 2026-09-22, their provenance and the source author's thresholds. `overheating.mjs` renders the dated section with a date selector, four trend charts, ranking states, original records, and date-scoped CSV export. `overheating.css` contains scoped presentation rules. Deploy these three files with the existing static files. This is a manually maintained snapshot, not a live data source; do not advance its date without new observations.

Run the complete check suite with `node --test tests/*.test.mjs`.
