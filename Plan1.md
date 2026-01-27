# Stock Trading Terminal - Development Plan

## Project Overview

Build a Bloomberg-style web trading terminal with dark theme, moveable/resizable components, and comprehensive market data display. Uses Financial Modeling Prep (FMP) API for data.

## Design Reference

- Dark terminal aesthetic (black/dark grey background, green/red for positive/negative)
- Dense information display with small, readable fonts
- Professional financial terminal look (similar to Bloomberg/Reuters)
- Multiple widget panels that can be rearranged

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (dark theme)
- **Charts**: TradingView Lightweight Charts (free, professional look)
- **HTTP Client**: fetch (native) with custom hooks

### Data
- **API**: Financial Modeling Prep (FMP) - https://financialmodelingprep.com/
- **API Key**: stored in `.env` as `VITE_FMP_API_KEY`

---

## Component Architecture

```
<App>
  <StockDescription>
    <TickerInput />           // Search bar with autocomplete
    <CompanyHeader />         // Logo, name, ticker, website
    <PriceBar />              // Price, change, volume, timestamp
    <div className="flex">
      <div className="flex-1">
        <PriceChart />        // Candlestick chart
        <StatsBar />          // Price, shares, market cap, EPS
        <AnalystRatings />    // Ratings table
      </div>
      <SnapshotPanel />       // Right sidebar with ratios
    </div>
  </StockDescription>
</App>
```

---

## Phase 1: Foundation (Start Here)

### 1.1 Project Setup
```bash
npm create vite@latest trading-terminal -- --template react-ts
cd trading-terminal
npm install react-grid-layout tailwindcss @types/react-grid-layout
npm install axios @tanstack/react-query
npm install lightweight-charts  # TradingView charts
```

### 1.2 Base Layout
- Configure Tailwind with dark theme as default
- Create base `<GridLayout>` wrapper
- Create reusable `<Widget>` component with:
  - Dark header bar with title
  - Close/maximize buttons (styled as in screenshot)
  - Content area
  - Resize handles

### 1.3 Theme/Design Tokens
```css
/* Core colors from screenshot */
--bg-primary: #0a0a0a;      /* Main background */
--bg-secondary: #1a1a1a;    /* Widget background */
--bg-tertiary: #252525;     /* Input/table row backgrounds */
--border: #333333;          /* Borders */
--text-primary: #ffffff;    /* Main text */
--text-secondary: #888888;  /* Muted text */
--accent-green: #00c853;    /* Positive values */
--accent-red: #ff5252;      /* Negative values */
--accent-blue: #4dabf7;     /* Links, highlights */
--accent-orange: #ffa726;   /* Warnings, targets */
```

---

## Phase 2: Stock Description Component (Priority)

This is the main component from Screenshot 2.

### 2.1 Component Structure

```
<StockDescription>
  <TickerInput />           // Search bar at top
  <CompanyHeader>           // Logo, name, ticker badge, website
    <Logo />
    <CompanyInfo />
  </CompanyHeader>
  <PriceBar />              // Current price, change, volume
  <TabNavigation />         // [Chart] [Stats] [Earnings] [News] etc.
  <TabContent>
    <ChartTab />            // Price chart with timeframe selector
    <StatsTab />            // Snapshot data (ratios, market info)
    <AnalystTab />          // Analyst ratings table
    <EarningsTab />         // EPS estimates
    <NewsTab />             // Company news
  </TabContent>
</StockDescription>
```

### 2.2 FMP API Endpoints Needed

| Data | Endpoint | Notes |
|------|----------|-------|
| Company Profile | `/api/v3/profile/{symbol}` | Name, description, logo, sector, CEO |
| Quote | `/api/v3/quote/{symbol}` | Price, change, volume, market cap |
| Key Metrics | `/api/v3/key-metrics/{symbol}` | P/E, P/B, EV/EBITDA, etc. |
| Ratios | `/api/v3/ratios/{symbol}` | Valuation ratios |
| Historical Price | `/api/v3/historical-price-full/{symbol}` | OHLCV for charts |
| Analyst Estimates | `/api/v3/analyst-estimates/{symbol}` | EPS estimates |
| Analyst Ratings | `/api/v3/grade/{symbol}` | Buy/Sell ratings |
| Company News | `/api/v3/stock_news?tickers={symbol}` | Recent news |
| Earnings Calendar | `/api/v3/earning_calendar?symbol={symbol}` | Earnings dates |

### 2.3 Data Types

```typescript
interface CompanyProfile {
  symbol: string;
  companyName: string;
  description: string;
  image: string;           // Logo URL
  website: string;
  ceo: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  address: string;
  city: string;
}

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  eps: number;
  yearHigh: number;
  yearLow: number;
}

interface AnalystRating {
  symbol: string;
  date: string;
  gradingCompany: string;  // "Scotiabank", "JP Morgan"
  previousGrade: string;
  newGrade: string;        // "Sector Perform", "Neutral"
  priceTarget?: number;
}
```

### 2.4 UI Elements to Replicate (from screenshot)

**Header Section:**
- Company logo (rounded square)
- Company name + "(NewCo)" tag
- [EQ] badge (equity type)
- Website link with icon
- Address line
- CEO name

**Price Bar:**
- Ticker: `LAC US`
- Price: `$6.61`
- Change: `+0.48 +7.90%` (green)
- Volume: `19.4M`
- Bid/Ask: `B6.61×476 / 6.62×200A`
- Timestamp: `At: 16:12:05`

**Snapshot Panel (right side):**
```
Market Info
  Exchange          XNYS
  Currency          USD
  Float             278.6M

Company Stats
  Employees         -
  Insiders          7.90%
  Institutions      19.93%

Valuation Ratios
  P/Sales           -
  P/Book            2.95
  EV/EBITDA         -64.62
  EV/R              -
  EV                2.2B
  Trl P/E           -
  Fwd P/E           -

Risk & Sentiment
  Beta              3.52
  Short             23.6M
  Short R           2.15
```

**Chart Section:**
- Timeframe buttons: [1 Year] [Intraday]
- Candlestick chart (TradingView style)
- Volume bars at bottom
- Price levels on right axis

**Stats Bar:**
- Price, Shares Out, Market Cap
- EPS Estimates table (Q1, FY26 columns)

**Analyst Ratings Table:**
| Firm | Analyst | Rating | Target | Date |
|------|---------|--------|--------|------|
| Scotiabank | Ben Isaacson | Sector Perform | $5→$7 | 01/12/26 |
| JP Morgan | Bill Peterson | Neutral | - | 11/06/25 |

---

---

## File Structure

```
trading-terminal/
├── src/
│   ├── components/
│   │   ├── StockDescription/
│   │   │   ├── index.tsx           # Main container
│   │   │   ├── TickerInput.tsx     # Search with autocomplete
│   │   │   ├── CompanyHeader.tsx   # Logo, name, badges
│   │   │   ├── PriceBar.tsx        # Price, change, volume
│   │   │   ├── SnapshotPanel.tsx   # Right side ratios/stats
│   │   │   ├── PriceChart.tsx      # TradingView chart
│   │   │   ├── AnalystRatings.tsx  # Ratings table
│   │   │   └── StatsBar.tsx        # Bottom stats row
│   │   └── common/
│   │       ├── Badge.tsx           # [EQ] style badges
│   │       └── PriceChange.tsx     # Green/red value formatting
│   ├── hooks/
│   │   ├── useCompanyProfile.ts
│   │   ├── useQuote.ts
│   │   ├── useKeyMetrics.ts
│   │   ├── useAnalystGrades.ts
│   │   ├── useHistoricalPrice.ts
│   │   └── useTickerSearch.ts      # For autocomplete
│   ├── services/
│   │   └── fmp.ts                  # FMP API client with delay
│   ├── types/
│   │   └── fmp.ts                  # TypeScript interfaces
│   ├── utils/
│   │   ├── formatters.ts           # Number/currency/date formatting
│   │   └── delay.ts                # Rate limit helper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Tailwind + dark theme vars
├── .env                            # VITE_FMP_API_KEY=xxx
├── tailwind.config.js
└── package.json
```

---

## Implementation Order

### Sprint 1: Project Setup
1. [ ] Create Vite + React + TS project
2. [ ] Configure Tailwind with dark theme (colors from reference)
3. [ ] Create base App shell with dark background
4. [ ] Set up .env with FMP API key

### Sprint 2: FMP Integration
1. [ ] Create FMP API service with axios
2. [ ] Add small delay utility between calls (100-200ms)
3. [ ] Create TypeScript types for FMP responses
4. [ ] Create hooks: `useCompanyProfile`, `useQuote`, `useKeyMetrics`, `useAnalystGrades`, `useHistoricalPrice`
5. [ ] Test with hardcoded symbol (LAC)

### Sprint 3: Stock Description - Core
1. [ ] TickerInput with search-as-you-type dropdown
2. [ ] CompanyHeader (logo, name, ticker badge, website link)
3. [ ] PriceBar (price, change %, volume, timestamp)
4. [ ] Basic layout matching screenshot

### Sprint 4: Stock Description - Data Panels
1. [ ] SnapshotPanel (right side - ratios, market info, stats)
2. [ ] PriceChart using TradingView Lightweight Charts
3. [ ] StatsBar (price, shares out, market cap, EPS estimates)
4. [ ] AnalystRatings table

### Sprint 5: Polish
1. [ ] Loading states / skeletons
2. [ ] Error handling (invalid ticker, API errors)
3. [ ] Final styling tweaks to match reference

---

## FMP API Notes

### Rate Limiting Strategy (Development)
- **No auto-refresh** - data loads once on page load / ticker change
- **Delay between calls** - add 100-200ms between sequential API calls
- **Bulk endpoints** - use comma-separated symbols where possible to reduce calls

### API Key Usage
```typescript
// services/fmp.ts
const FMP_BASE = 'https://financialmodelingprep.com/api/v3';
const API_KEY = import.meta.env.VITE_FMP_API_KEY;

// Helper to add delay between calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fmp = {
  profile: async (symbol: string) => {
    const res = await fetch(`${FMP_BASE}/profile/${symbol}?apikey=${API_KEY}`);
    await delay(150); // Rate limit protection
    return res.json();
  },
  quote: async (symbol: string) => {
    const res = await fetch(`${FMP_BASE}/quote/${symbol}?apikey=${API_KEY}`);
    await delay(150);
    return res.json();
  },
  search: async (query: string) => {
    const res = await fetch(`${FMP_BASE}/search?query=${query}&limit=10&apikey=${API_KEY}`);
    await delay(150);
    return res.json();
  },
  // etc.
};
```

### Search Endpoint for Autocomplete
```
GET /api/v3/search?query=LAC&limit=10&apikey=xxx

Returns:
[
  { symbol: "LAC", name: "Lithium Americas Corp", currency: "USD", exchangeShortName: "NYSE" },
  { symbol: "LACQ", name: "...", ... }
]
```

---

## Decisions Made

1. **Symbol search**: Search-as-you-type using FMP search endpoint (`/api/v3/search?query=`)
2. **Scope**: Focus on Stock Description widget only for now - add more widgets iteratively later
3. **Data refresh**: Manual only (on page refresh) during development to conserve API calls
4. **Rate limiting**: Add small delays between API calls (e.g., 100-200ms) to avoid hitting limits
5. **Multiple instances**: Not needed yet - single description widget for now

---

## Commands for Claude Code

When starting implementation, use these prompts in sequence:

```
# 1. Initial setup
Create a Vite React TypeScript project called "trading-terminal". Configure Tailwind CSS with a dark theme using these colors: bg-primary #0a0a0a, bg-secondary #1a1a1a, bg-tertiary #252525, border #333333, text-primary #ffffff, text-secondary #888888, accent-green #00c853, accent-red #ff5252, accent-blue #4dabf7. Create a .env.example file for the FMP API key.

# 2. FMP Service Layer  
Create the FMP API service in src/services/fmp.ts with TypeScript types in src/types/fmp.ts. Include endpoints for: profile, quote, search, key-metrics, ratios, grade (analyst ratings), and historical-price-full. Add a 150ms delay between calls for rate limiting. Create React hooks for each endpoint.

# 3. Ticker Search Component
Build TickerInput component with search-as-you-type. Use the FMP search endpoint. Show dropdown with symbol, name, and exchange. Debounce input by 300ms. Style to match dark terminal theme.

# 4. Company Header + Price Bar
Build CompanyHeader showing logo, company name, ticker badge, and website link. Build PriceBar showing current price, change, change%, volume, and timestamp. Use green for positive, red for negative values.

# 5. Snapshot Panel
Build the right-side SnapshotPanel with sections: Market Info (exchange, currency, float), Company Stats (employees, insiders%, institutions%), Valuation Ratios (P/Sales, P/Book, EV/EBITDA, EV/R, EV, Trl P/E, Fwd P/E), Dividend & Yield, Risk & Sentiment (beta, short interest).

# 6. Price Chart
Add TradingView Lightweight Charts showing 1 year of candlestick data with volume. Include timeframe buttons (1Y, Intraday). Dark theme matching the terminal.

# 7. Analyst Ratings + Stats
Build AnalystRatings table with columns: Firm, Analyst, Rating, Target, Date. Build StatsBar showing Price, Shares Out, Market Cap, and EPS Estimates table.

# 8. Final Assembly
Combine all components into the main StockDescription widget. Add loading states and error handling. Test with LAC ticker.
```

---

## Success Criteria

Description widget complete when:
- [ ] Can type ticker and see search results dropdown (search-as-you-type)
- [ ] Selecting ticker loads all company data
- [ ] Logo, name, description, website display correctly
- [ ] Price bar shows current quote with green/red coloring
- [ ] Snapshot panel shows key ratios and market info
- [ ] Price chart renders with 1Y candlestick data
- [ ] Analyst ratings table populated with firm, rating, target, date
- [ ] Stats bar shows market cap, shares outstanding, EPS estimates
- [ ] Dark theme matches reference aesthetic
- [ ] Loading states shown while data fetches
- [ ] Graceful error handling for invalid tickers
