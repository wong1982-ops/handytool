# Currency Exchange Tool — Implementation Plan

**Date:** 2026-02-11
**Status:** IN PROGRESS
**Design source:** `designs/9.CurrencyExchange/` (Design 1 — Converter-first)

## Overview

Currency exchange converter with live rates from frankfurter.app, historical rate chart, stats cards, and top currency pairs sidebar.

## Data Source

- **API:** [frankfurter.app](https://api.frankfurter.app) — free, no API key, CORS-friendly, ECB data
- **Endpoints:**
  - `GET /currencies` — list of ~33 supported currencies
  - `GET /latest?amount=1000&from=USD&to=EUR` — latest conversion
  - `GET /2025-01-01..2025-02-01?from=USD&to=EUR` — historical rates for chart
- **Called directly from client** (no proxy needed)

## Components

### 1. `tools/currency-exchange/converter-bar.tsx`
- Amount number input with `$` prefix
- From/To currency `<select>` with emoji flags
- Swap button (rotates 180° on hover)
- Convert button (primary blue)
- Result display: formatted amount + currency name + daily % change

### 2. `tools/currency-exchange/rate-chart.tsx`
- Pure SVG line chart (no library)
- Gradient fill under curve
- Period selectors: 1W, 1M, 3M, 6M, 1Y
- Hover tooltip showing date + rate
- Grid lines + axis labels

### 3. `tools/currency-exchange/stats-row.tsx`
- 3 cards: Period High, Period Low, Volatility Score
- Computed from chart historical data
- Volatility = (high - low) / avg * 100, labeled Low/Medium/High

### 4. `tools/currency-exchange/currency-pairs.tsx`
- Top 4 pairs: EUR/USD, GBP/USD, USD/JPY, AUD/USD
- Emoji flag pairs, rate, daily % change (green/red)
- Clickable — updates converter to that pair

### 5. `app/tools/currency-exchange/page.tsx`
- Owns all state (amount, from, to, rates, chartData)
- API integration with frankfurter.app
- Loading skeleton, error state, breadcrumb
- 8/4 grid layout (chart left, pairs right)

### 6. `lib/tools.tsx`
- Add Currency Exchange entry with currency_exchange icon

## Layout (Desktop)

```
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Home / Currency Exchange             │
├─────────────────────────────────────────────────┤
│ [Amount] [From ▼] [⇄] [To ▼]  [Convert →]     │
│ 1,000.00 US Dollar = 924.35 Euros    ↑0.24%     │
├──────────────────────────┬──────────────────────┤
│ Exchange Rate Trend      │ Top Currency Pairs    │
│ [1W] [1M] [3M] [6M] [1Y]│ EUR/USD  1.0854 +0.1%│
│ ┌────────────────────┐   │ GBP/USD  1.2721 -0.1%│
│ │  SVG Line Chart    │   │ USD/JPY  156.45 +0.5%│
│ └────────────────────┘   │ AUD/USD  0.6621 -0.2%│
├──────────────────────────┤                      │
│ [High] [Low] [Volatility]│                      │
└──────────────────────────┴──────────────────────┘
```

## Cut (YAGNI)
- Set Price Alerts CTA (no backend)
- Latest Insights news feed (no news API)
- Footer (shared layout handles this)
