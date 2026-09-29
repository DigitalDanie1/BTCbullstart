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

## 일별 API 갱신

`node scripts/refresh-overheating.mjs YYYY-MM-DD` 후 `node --test tests/*.test.mjs`를 실행합니다. Node 20 이상이 필요합니다. 날짜를 생략하면 UTC 오늘까지 수집합니다.

- 2026-09-22까지 사용자 원본은 보존합니다.
- 이후 CoinMarketCap 공식 공포탐욕 API의 UTC 관측일과 업비트 KRW-BTC UTC 일봉을 수집합니다. 당일 값은 잠정값입니다. 기사 발행일과 API 관측일을 혼용하지 않습니다.
- 순위, 김치프리미엄, TradingView 도미넌스, MVRV-Z는 동일 기준의 원천 기록이 확인될 때까지 null입니다. 이전 값을 복사하거나 다른 제공기관 지표로 대체하지 않습니다.
- `data/daily-overheating.json` / `.mjs`는 생성 파일입니다. `data/evidence/`에 해당 수집 응답을 보관합니다. 실패 시 기존 관측값을 유지하고 전체 수집 실패는 오류로 종료합니다.
- 갱신 후 변경 파일을 커밋하고 main에 반영하면 기존 Vercel 배포가 갱신됩니다. 매일 갱신 작업은 Codex 예약 작업에서 수행합니다. 사이트 자체는 정적 스냅샷이며 방문만으로 갱신되지 않습니다.
