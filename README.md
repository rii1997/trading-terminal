<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 19.2" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.1" />
  <img src="https://img.shields.io/badge/Vite-7.2-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7.2" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

# Trading Terminal

A professional-grade, Bloomberg-style trading terminal built with React and TypeScript. Features real-time market data, 24 distinct widget types, a multi-board workspace with draggable/resizable windows, and comprehensive financial analysis tools — all powered by the Financial Modeling Prep API.

---

## Table of Contents

- [Features at a Glance](#features-at-a-glance)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [Application Architecture](#application-architecture)
  - [Workspace System](#workspace-system)
  - [Window System](#window-system)
  - [Data Flow](#data-flow)
  - [State Management](#state-management)
- [Project Structure](#project-structure)
- [Widgets Reference](#widgets-reference)
  - [Analysis Widgets](#analysis-widgets)
  - [Market Widgets](#market-widgets)
  - [Calendar Widgets](#calendar-widgets)
  - [Trading Widgets](#trading-widgets)
  - [Research Widgets](#research-widgets)
- [API Reference](#api-reference)
  - [FMP API Endpoints](#fmp-api-endpoints)
  - [External APIs](#external-apis)
  - [Rate Limiting](#rate-limiting)
- [Custom Hooks](#custom-hooks)
- [Services Layer](#services-layer)
- [Utilities](#utilities)
- [Styling & Design System](#styling--design-system)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Netlify](#netlify)
  - [Manual / Docker](#manual--docker)
- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Performance Considerations](#performance-considerations)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features at a Glance

| Category | Features |
|----------|----------|
| **Workspace** | Multi-board tabs, drag-and-drop widget canvas, localStorage persistence, board duplication/rename/delete |
| **Stock Analysis** | Company profiles, interactive candlestick charts, key metrics, financial ratios, DCF valuation, peer comparison, executive info |
| **Financial Statements** | Income Statement, Balance Sheet, Cash Flow — annual & quarterly with YoY growth and inline metric charts |
| **Screening** | Advanced equity screener with 40+ filters across descriptive, valuation, profitability, financial health, and technical categories |
| **Market Overview** | World equity indices, commodities, sector performance heatmap, market movers (gainers/losers/most active) |
| **Calendars** | Earnings, IPO, stock split, dividend, and economic event calendars with week navigation |
| **Trading Activity** | Insider trades, congressional (House) trades, SEC EDGAR filings browser |
| **News & Research** | Company-specific news, general market news, press releases, analyst ratings with price targets |
| **Comparison** | Multi-stock side-by-side ratio comparison with interactive multi-line charts |
| **UI/UX** | Bloomberg-dark terminal aesthetic, monospace typography, draggable/resizable windows, cross-widget symbol navigation |

---

## Live Demo

> Deployed on Vercel — requires an FMP API key set as an environment variable.

---

## Quick Start

### Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** (comes with Node.js)
- **FMP API Key** — get one at [financialmodelingprep.com](https://financialmodelingprep.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/rii1997/trading-terminal.git
cd trading-terminal

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your FMP API key:
# VITE_FMP_API_KEY=your_api_key_here

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start Vite dev server with HMR |
| **Build** | `npm run build` | Type-check with `tsc` then build for production |
| **Preview** | `npm run preview` | Preview the production build locally |
| **Lint** | `npm run lint` | Run ESLint across the project |
| **Test** | `npm run test` | Run Vitest test suite once |
| **Test Watch** | `npm run test:watch` | Run tests in watch mode |
| **Test UI** | `npm run test:ui` | Run tests with Vitest UI |

---

## Architecture

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | React | 19.2 | UI framework |
| **Language** | TypeScript | 5.9 | Type-safe development (strict mode) |
| **Bundler** | Vite | 7.2 | Dev server, HMR, production builds |
| **Styling** | Tailwind CSS | 4.1 | Utility-first CSS (Vite plugin integration) |
| **Charts** | Lightweight Charts | 5.1 | TradingView candlestick/bar/line charts |
| **Windows** | react-rnd | 10.5 | Draggable + resizable window system |
| **Testing** | Vitest + Testing Library | 4.0 / 16.3 | Unit & integration testing |
| **Linting** | ESLint | 9.39 | Code quality (flat config) |
| **Deployment** | Vercel | — | Hosting & CI/CD |

### Application Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  App.tsx                                                    │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  BoardTabBar                                          │  │  │
│  │  │  [Board 1] [Board 2] [Board 3] [+] [Add Widget]      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │  │
│  │  │ DraggableWindow │  │ DraggableWindow │                 │  │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │                 │  │
│  │  │ │ Stock       │ │  │ │ Financials  │ │   ┌───────────┐ │  │
│  │  │ │ Description │ │  │ │             │ │   │ Widget    │ │  │
│  │  │ │             │ │  │ │             │ │   │ Picker    │ │  │
│  │  │ │ ┌─────────┐ │ │  │ │             │ │   │ (Modal)   │ │  │
│  │  │ │ │ Chart   │ │ │  │ │             │ │   │           │ │  │
│  │  │ │ └─────────┘ │ │  │ │             │ │   └───────────┘ │  │
│  │  │ └─────────────┘ │  │ └─────────────┘ │                 │  │
│  │  └─────────────────┘  └─────────────────┘                 │  │
│  │                                                            │  │
│  │  useWorkspace (localStorage persistence)                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │  Custom Hooks     │                        │
│                    │  (useQuote, etc.) │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │  FMP Service      │                        │
│                    │  (src/services/)  │                        │
│                    └─────────┬─────────┘                        │
│                              │ 150ms rate limiting               │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTPS
                    ┌──────────┴──────────┐
                    │  FMP API            │
                    │  financialmodeling  │
                    │  prep.com/stable    │
                    └─────────────────────┘
```

### Workspace System

The workspace is a multi-board canvas architecture that persists to `localStorage`.

**Data Model:**
```
Workspace
├── boards: Board[]
│   ├── id: string (UUID)
│   ├── name: string
│   ├── createdAt: number
│   └── widgets: Widget[]
│       ├── id: string (UUID)
│       ├── type: WidgetType (one of 24 types)
│       ├── position: { x: number, y: number }
│       ├── size: { width: number, height: number }
│       └── config?: { symbol?: string, ... }
└── activeBoardId: string
```

**Board Operations:**
- Create, rename, duplicate, delete boards (minimum 1 board enforced)
- Switch between boards via tab bar
- Right-click context menu on board tabs

**Widget Operations:**
- Add widgets from categorized picker modal (5 categories, 24 widget types)
- Remove widgets per board
- Drag to reposition, resize via corner/edge handles
- Update widget config (e.g., change tracked symbol)
- New widgets auto-cascade position to avoid stacking

**Persistence:**
- Full workspace state serialized to `localStorage` under key `trading-terminal-workspace`
- Lazy initialization with fallback to a default "Market Overview" board pre-populated with 5 starter widgets

### Window System

The `DraggableWindow` component wraps every widget, providing:

| Feature | Implementation |
|---------|---------------|
| **Drag** | Title bar acts as drag handle (`window-drag-handle` CSS class) |
| **Resize** | Corner and edge handles via `react-rnd` |
| **Maximize/Restore** | Toggle button saves/restores position and size |
| **Close** | Removes widget from active board |
| **Z-Index** | Base `z-index: 100`, Financials chart sub-windows use `200+` |
| **Bounds** | Constrained to browser `window` |
| **Header Content** | Widgets can inject custom React nodes (e.g., search inputs) into the title bar via `headerContent` prop |

**Cross-Widget Navigation:**
Widgets can trigger navigation to other widgets via `openWidgetWithSymbol(type, symbol)`. For example, clicking "Insider Trades" in StockDescription opens or updates the InsiderTrades widget with the current symbol.

### Data Flow

```
User Action
    │
    ▼
Custom Hook (useQuote, useKeyMetrics, etc.)
    │
    ▼
FMP Service (src/services/fmp.ts)
    │
    ├── fetchFMP<T>() generic helper
    ├── Appends API key from env
    ├── Tracks call via ApiTracker
    ├── Logs via Logger
    └── Enforces 150ms rate-limit delay
    │
    ▼
FMP REST API (HTTPS)
    │
    ▼
JSON Response
    │
    ▼
Hook State Update (useState/useEffect)
    │
    ▼
Component Re-render
```

### State Management

The application uses **React's built-in primitives** — no external state library:

- **`useState`** — Local component state for each widget
- **`useCallback`** — Memoized handlers for cross-widget communication
- **`useEffect`** — Data fetching triggered by dependency changes
- **`useWorkspace`** — Custom hook managing workspace/board/widget state with localStorage persistence
- **Cross-widget communication** — Callback props threaded through `App.tsx` (e.g., `onOpenFinancials`, `onOpenInsiderTrades`)

---

## Project Structure

```
trading-terminal/
├── index.html                         # SPA entry point
├── package.json                       # Dependencies & scripts
├── vite.config.ts                     # Vite + Tailwind + CSP dev headers
├── tailwind.config.js                 # Dark theme color palette
├── tsconfig.json                      # Root TypeScript config
├── tsconfig.app.json                  # App TypeScript config (strict mode)
├── tsconfig.node.json                 # Node TypeScript config
├── vitest.config.ts                   # Test config (node env, 30s timeout)
├── eslint.config.js                   # ESLint 9 flat config
├── vercel.json                        # Vercel deployment config
├── .env.example                       # Environment variable template
├── .gitignore                         # Git ignore rules
│
├── src/
│   ├── main.tsx                       # React entry — createRoot, renders <App />
│   ├── index.css                      # Global CSS variables (dark theme tokens)
│   ├── App.tsx                        # Root component — workspace shell, widget routing
│   │
│   ├── types/
│   │   ├── workspace.ts               # Board, Widget, WidgetType, WidgetDefinition types
│   │   │                              #   + WIDGET_DEFINITIONS (24 widgets, 5 categories)
│   │   └── fmp.ts                     # All FMP API response types (34+ interfaces)
│   │
│   ├── services/
│   │   └── fmp.ts                     # FMP API service (50+ typed methods, rate limiting)
│   │
│   ├── hooks/
│   │   ├── index.ts                   # Barrel export for core hooks
│   │   ├── useWorkspace.ts            # Board/widget CRUD + localStorage persistence
│   │   ├── useTickerSearch.ts         # Debounced search with smart result ranking
│   │   ├── useCompanyProfile.ts       # Company profile data
│   │   ├── useQuote.ts               # Real-time quote
│   │   ├── useKeyMetrics.ts          # Valuation metrics
│   │   ├── useRatios.ts              # Financial ratios (annual)
│   │   ├── useRatiosTTM.ts           # Financial ratios (trailing 12 months)
│   │   ├── useSharesFloat.ts         # Float data
│   │   ├── useDividends.ts           # Dividend history
│   │   ├── useAnalystGrades.ts       # Analyst ratings
│   │   ├── useAnalystEstimates.ts    # EPS/revenue estimates
│   │   ├── useHistoricalPrice.ts     # OHLCV price history
│   │   ├── useFinancialStatements.ts # Income/balance/cash flow
│   │   ├── useScreener.ts           # Equity screener (server + client filtering)
│   │   ├── useDCF.ts                # DCF valuation
│   │   ├── useStockPeers.ts         # Peer companies
│   │   ├── useKeyExecutives.ts      # Management team
│   │   ├── useEmployeeCount.ts      # Employee history
│   │   ├── useStockNews.ts          # Company & market news
│   │   ├── useArticles.ts           # FMP articles
│   │   ├── useCommodities.ts        # Commodity prices
│   │   └── useWorldIndices.ts       # Global market indices
│   │
│   ├── components/
│   │   ├── DraggableWindow.tsx        # Rnd-based floating window container
│   │   ├── BoardTabBar.tsx            # Board tab strip + context menu
│   │   ├── WidgetPicker.tsx           # Modal for adding widgets (categorized)
│   │   │
│   │   ├── StockDescription/          # 13 files — flagship stock analysis widget
│   │   │   ├── index.tsx              # Main component (14 hooks)
│   │   │   ├── InlineTickerInput.tsx  # Autocomplete ticker search in title bar
│   │   │   ├── PriceBar.tsx           # Live price display with change %
│   │   │   ├── CompanyHeader.tsx      # Logo, name, sector, description
│   │   │   ├── PriceChart.tsx         # Interactive candlestick + volume chart
│   │   │   ├── StatsBar.tsx           # Quick stats + cross-widget nav buttons
│   │   │   ├── AnalystRatings.tsx     # Grade breakdown (inline)
│   │   │   ├── SnapshotPanel.tsx      # Key metrics right sidebar
│   │   │   ├── CompanyInfo.tsx        # DCF, peers, executives, employees
│   │   │   └── DebugPanel.tsx         # API call logger (toggle)
│   │   │
│   │   ├── EquityScreener/            # 12 files — advanced stock screener
│   │   │   ├── index.tsx              # Main screener component
│   │   │   ├── FilterTabs.tsx         # Tab navigation
│   │   │   ├── FilterPanel.tsx        # Filter control grid
│   │   │   ├── RangeSlider.tsx        # Min/max numeric range slider
│   │   │   ├── SelectFilter.tsx       # Dropdown multi-select
│   │   │   ├── ActiveFilters.tsx      # Removable filter chips
│   │   │   ├── ScreenerTable.tsx      # Results table with sorting
│   │   │   ├── SparklineChart.tsx     # Mini 30-day price chart
│   │   │   └── Pagination.tsx         # Page navigation
│   │   │
│   │   ├── Financials/                # Financial statements + metric charts
│   │   ├── Compare/                   # Multi-symbol ratio comparison
│   │   ├── AnalystRatings/            # Full analyst ratings view
│   │   ├── Earnings/                  # Earnings history
│   │   ├── EarningsMatrix/            # Quarterly earnings grid
│   │   ├── Dividends/                 # Dividend history & yield
│   │   ├── Ratios/                    # Financial ratios deep dive
│   │   ├── News/                      # News aggregator
│   │   ├── PressReleases/             # Company press releases
│   │   ├── SECFilings/                # SEC EDGAR browser
│   │   ├── InsiderTrades/             # Insider trading activity
│   │   ├── CongressTrades/            # Congressional trades
│   │   ├── WorldEquityIndex/          # Global indices overview
│   │   ├── Commodities/              # Commodity prices
│   │   ├── SectorPerformance/         # Sector heatmap
│   │   ├── MarketMovers/              # Gainers/losers/most active
│   │   ├── IndexHoldings/             # Index constituents
│   │   ├── EarningsCalendar/          # Earnings dates
│   │   ├── IPOCalendar/               # IPO tracking
│   │   ├── SplitCalendar/             # Stock splits
│   │   ├── DividendCalendar/          # Ex-dividend dates
│   │   └── EconomicCalendar/          # Economic events
│   │
│   ├── utils/
│   │   ├── formatters.ts             # formatLargeNumber, formatCurrency, formatPercent, etc.
│   │   ├── delay.ts                  # Promise-based delay + API_DELAY constant (150ms)
│   │   └── logger.ts                # Logger (ring buffer) + ApiTracker (call monitoring)
│   │
│   └── test/
│       ├── setup.ts                  # Test setup
│       ├── fmp.test.ts              # FMP API integration tests
│       └── worldIndices.test.ts     # World indices hook tests
│
├── Plan1.md                          # Original design plan
└── FMP endpoints.md                  # FMP API endpoint reference
```

---

## Widgets Reference

The terminal includes **24 widget types** organized into 5 categories. Each widget runs inside a `DraggableWindow` and can be added to any board via the Widget Picker.

### Analysis Widgets

#### Stock Description
The flagship widget — a comprehensive stock analysis view.

**Sub-components:** InlineTickerInput, PriceBar, CompanyHeader, PriceChart (candlestick + volume), StatsBar (with cross-widget navigation buttons: FA, EM, ANR, IN, CG, DIV, Press, SEC), AnalystRatings (inline), CompanyInfo (DCF, peers, executives, employees), SnapshotPanel (key metrics sidebar), DebugPanel (API call logger).

Uses 14 hooks simultaneously. Default symbol: `TSLA`.

**API Endpoints:** `/profile`, `/quote`, `/key-metrics`, `/ratios`, `/ratios-ttm`, `/shares-float`, `/dividends`, `/grades`, `/analyst-estimates`, `/historical-price-eod/full`, `/discounted-cash-flow`, `/stock-peers`, `/key-executives`, `/employee-count`

---

#### Financials
Full financial statements with inline metric charting.

- **Statements:** Income Statement, Balance Sheet, Cash Flow Statement
- **Periods:** Annual (40 periods) and Quarterly (40 periods) toggle
- **YoY Growth:** Automatic year-over-year growth % calculation for every line item
- **Sparklines:** Trend visualization for each metric row
- **Metric Charts:** Click any row's chart button to open a floating `MetricChart` window (rendered via `createPortal` to `document.body` at `zIndex: 200+`) using Lightweight Charts bar rendering

**API Endpoints:** `/income-statement`, `/balance-sheet-statement`, `/cash-flow-statement`

---

#### Ratios
Deep dive into financial ratios with multi-year history.

| Ratio Category | Metrics |
|----------------|---------|
| **Valuation** | P/E, P/B, P/S, EV/EBITDA |
| **Profitability** | ROE, ROA, ROIC, Gross/Operating/Net Margin |
| **Liquidity** | Current Ratio, Quick Ratio |
| **Leverage** | Debt/Equity, Interest Coverage |
| **Efficiency** | Asset Turnover, Inventory Turnover |

**API Endpoints:** `/ratios`, `/ratios-ttm`, `/key-metrics`

---

#### Earnings
Historical earnings performance with beat/miss analysis.

- EPS actual vs estimate comparison with surprise %
- Revenue actual vs estimate
- Beat/miss/meet classification and highlighting
- Historical trend visualization

**API Endpoints:** `/earnings`

---

#### Earnings Matrix
Quarterly earnings grid — Q1 through Q4 across multiple years.

- Matrix layout: years as rows, quarters as columns
- Revenue and EPS per quarter
- YoY growth comparison
- Beat/miss color highlighting

**API Endpoints:** `/earnings`, `/analyst-estimates`

---

#### Dividends
Dividend history and yield analysis.

- Dividend yield calculation, ex-dividend dates, payment frequency
- Dividend growth rate tracking
- Payout ratio analysis

**API Endpoints:** `/dividends`, `/quote`

---

#### Analyst Ratings
Comprehensive analyst coverage with consensus ratings and price targets.

- Consensus rating calculation (Strong Buy → Strong Sell)
- Price target range bar visualization (low / consensus / high)
- Current price position overlay on target range
- Upside/downside % calculation
- Full rating history table with firm names and grade changes

**API Endpoints:** `/grades`, `/price-target-consensus`, `/quote`

---

#### Compare
Multi-stock side-by-side comparison tool.

- Compare up to 5 stocks simultaneously
- 12 ratio metrics: P/E, P/B, P/S, ROE, ROA, margins, current ratio, debt ratios, interest coverage
- Time period selection: 1M, 3M, 6M, 1Y, 2Y, 5Y
- Multi-line Lightweight Charts visualization

**API Endpoints:** `/quote`, `/key-metrics`, `/ratios`

---

### Market Widgets

#### World Equity Index
Global market indices at a glance.

| Region | Indices |
|--------|---------|
| **US** | S&P 500, Dow Jones, Nasdaq, Russell 2000 |
| **Europe** | FTSE 100, DAX, CAC 40, Euro Stoxx 50 |
| **Asia** | Nikkei 225, Hang Seng, Shanghai Composite |

- Price and change % with red/green color coding
- Period performance columns: 1D, 1W, 1M, YTD, 1Y

**API Endpoints:** `/quote`, `/historical-price-eod/light`

---

#### Commodities
Real-time commodity prices and performance.

| Category | Commodities |
|----------|-------------|
| **Precious Metals** | Gold, Silver, Platinum |
| **Energy** | Crude Oil, Natural Gas, Heating Oil |
| **Agriculture** | Corn, Wheat, Soybeans, Coffee, Sugar |
| **Industrial** | Copper, Aluminum |

**API Endpoints:** `/quote`

---

#### Sector Performance
GICS sector performance ranking with color-coded bars.

- All 11 GICS sectors tracked via sector ETFs (XLK, XLF, XLE, XLV, etc.)
- Period comparison: 1W, 1M, 3M, YTD, 1Y
- Visual performance bars

**API Endpoints:** `/quote`, `/historical-price-eod/light`

---

#### Market Movers
Daily top gainers, losers, and most active stocks.

- Top gainers by % change
- Top losers by % change
- Most active by volume
- Click any row to open Stock Description for that symbol

**API Endpoints:** `/biggest-gainers`, `/biggest-losers`, `/most-active`

---

#### Index Holdings
Major index constituent browser.

- S&P 500, Nasdaq 100, Dow Jones 30 holdings
- Sortable by name, weight, sector
- Sector distribution breakdown
- Click to navigate to Stock Description

**API Endpoints:** `/sp500-constituent`, `/nasdaq-constituent`, `/dowjones-constituent`

---

### Calendar Widgets

#### Earnings Calendar
Upcoming and recent earnings dates with week navigation.

- Before/After market time indicators
- EPS estimate display
- Click any row to open Stock Description

**API Endpoints:** `/earnings-calendar`

---

#### IPO Calendar
IPO tracking for upcoming and recent offerings.

- Expected dates, exchange, price range, deal size estimates

**API Endpoints:** `/ipos-calendar`

---

#### Split Calendar
Upcoming stock split tracker with split ratios and effective dates.

**API Endpoints:** `/splits-calendar`

---

#### Dividend Calendar
Ex-dividend date tracker with dividend amount, yield, record/payment dates.

**API Endpoints:** `/dividends-calendar`

---

#### Economic Calendar
Economic events and macroeconomic indicators.

- Fed meetings, GDP, jobs reports, CPI, retail sales, housing data
- Actual vs Estimate vs Previous values
- Impact level indicator
- Country filtering

**API Endpoints:** `/economic-calendar`

---

### Trading Widgets

#### Insider Trades
Corporate insider buying and selling activity.

- Transaction type (Buy/Sell/Award) with color coding
- Insider name, title, shares, value
- Date filtering
- Symbol-specific and latest-across-market views

**API Endpoints:** `/insider-trading/search`, `/insider-trading/latest`, `/insider-trading/statistics`

---

#### Congress Trades
Congressional (House of Representatives) trading activity.

- Representative name and party
- Transaction type (Buy/Sell)
- Estimated value range
- Disclosure date

**API Endpoints:** `/house-trades`

---

#### Equity Screener
The most complex widget — an advanced stock screener with two-tier filtering.

**Architecture:**
1. **Server-side filters** → Sent directly to FMP API (`/company-screener`)
2. **Client-side enrichment** → Batch quote + TTM metrics fetched, then filtered in-memory

**Filter Categories:**

| Tab | Filters |
|-----|---------|
| **Descriptive** | Sector, Industry, Country, Exchange, Market Cap, Price, Volume, Beta, ETF/Fund toggle |
| **Valuation** | P/E, P/B, P/S, PEG, EV/EBITDA |
| **Profitability** | Gross Margin, Operating Margin, Net Margin, ROA, ROE, ROCE |
| **Financial Health** | Current Ratio, Quick Ratio, Cash Ratio, Debt/Equity, Debt Ratio |
| **Technical** | Price vs SMA50/SMA200, 52-Week High/Low proximity, Day Change % |

**UI Components:** FilterTabs, FilterPanel, RangeSlider, SelectFilter, ActiveFilters (removable pills), ScreenerTable (sortable), SparklineChart (mini 30-day chart), Pagination.

**API Endpoints:** `/company-screener`, `/batch-quote`, `/key-metrics-ttm`, `/ratios-ttm`

---

### Research Widgets

#### News
Company and market news aggregator.

- Symbol-filtered company news
- General market news tab
- FMP articles/editorial tab
- Source attribution and relative time formatting

**API Endpoints:** `/news`, `/news/stock-latest`, `/news/general-latest`, `/fmp-articles`

---

#### Press Releases
Company press releases and announcements — chronological listing with source filtering.

**API Endpoints:** `/news` (filtered)

---

#### SEC Filings
SEC EDGAR filings browser.

- Form type filtering: 10-K, 10-Q, 8-K, Proxy, Insider, Registration
- Color-coded form types
- Direct links to SEC.gov source documents
- Company CIK lookup
- Filing date and file size display
- Year-by-year filing summary

**API Endpoints:** `/profile` (for CIK), SEC EDGAR API: `https://data.sec.gov/submissions/CIK{cik}.json`

---

## API Reference

### FMP API Endpoints

All API calls route through the FMP service at `https://financialmodelingprep.com/stable`. The service layer (`src/services/fmp.ts`) provides typed methods for each endpoint.

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Company** | `/profile?symbol=` | Company profile, logo, sector, description |
| | `/quote?symbol=` | Real-time quote (price, change, volume) |
| | `/search-name?query=` | Ticker search autocomplete |
| **Financials** | `/income-statement?symbol=` | Income statement (annual/quarterly) |
| | `/balance-sheet-statement?symbol=` | Balance sheet |
| | `/cash-flow-statement?symbol=` | Cash flow statement |
| **Metrics** | `/key-metrics?symbol=` | Key valuation metrics |
| | `/key-metrics-ttm?symbol=` | TTM valuation metrics |
| | `/ratios?symbol=` | Financial ratios (annual) |
| | `/ratios-ttm?symbol=` | TTM financial ratios |
| **Analyst** | `/grades?symbol=` | Analyst ratings history |
| | `/analyst-estimates?symbol=` | EPS/revenue estimates |
| | `/price-target-consensus?symbol=` | Consensus price targets |
| **Historical** | `/historical-price-eod/full?symbol=` | Full OHLCV price history |
| | `/historical-price-eod/light?symbol=` | Lightweight price history |
| | `/earnings?symbol=` | Earnings history |
| | `/dividends?symbol=` | Dividend history |
| **News** | `/news?symbol=` | Company-specific news |
| | `/news/stock-latest` | Latest stock news |
| | `/news/general-latest` | General market news |
| | `/fmp-articles` | FMP editorial content |
| **Trading** | `/insider-trading/search?symbol=` | Insider trades by symbol |
| | `/insider-trading/latest` | Latest insider trades (all) |
| | `/insider-trading/statistics` | Insider trade statistics |
| | `/house-trades?symbol=` | Congressional trading |
| **Valuation** | `/discounted-cash-flow?symbol=` | DCF fair value |
| | `/stock-peers?symbol=` | Peer/similar companies |
| | `/key-executives?symbol=` | Management team |
| | `/employee-count?symbol=` | Employee count history |
| | `/shares-float?symbol=` | Shares float data |
| **Screener** | `/company-screener` | Stock screener (server-side) |
| | `/batch-quote?symbols=` | Batch quote lookup |
| **Calendars** | `/earnings-calendar?from=&to=` | Earnings dates |
| | `/ipos-calendar?from=&to=` | IPO dates |
| | `/splits-calendar?from=&to=` | Stock split dates |
| | `/dividends-calendar?from=&to=` | Dividend dates |
| | `/economic-calendar?from=&to=` | Economic events |
| **Market** | `/biggest-gainers` | Top gainers |
| | `/biggest-losers` | Top losers |
| | `/most-active` | Most active by volume |
| **Indices** | `/sp500-constituent` | S&P 500 holdings |
| | `/nasdaq-constituent` | Nasdaq 100 holdings |
| | `/dowjones-constituent` | Dow Jones 30 holdings |

### External APIs

| Source | Endpoint | Usage |
|--------|----------|-------|
| **SEC EDGAR** | `https://data.sec.gov/submissions/CIK{cik}.json` | SEC filings data for the SECFilings widget |

### Rate Limiting

FMP enforces rate limits based on subscription tier. The app includes a built-in **150ms delay** between consecutive API calls.

| Tier | Calls/Minute | Recommended Use |
|------|-------------|-----------------|
| Free | 5 | Development/testing only |
| Starter | 100 | Light usage |
| Essential | 300 | Standard usage for this app |
| Premium | 750 | High-frequency use |

---

## Custom Hooks

All custom hooks follow the pattern: fetch data on symbol/dependency change, store in local state, return `{ data, loading, error }`.

| Hook | Description | Dependencies | API Endpoints |
|------|-------------|-------------|---------------|
| `useWorkspace` | Board/widget CRUD + localStorage | — | None (local) |
| `useTickerSearch` | Debounced symbol search with smart ranking | query string | `/search-name` |
| `useCompanyProfile` | Company profile data | symbol | `/profile` |
| `useQuote` | Real-time quote | symbol | `/quote` |
| `useKeyMetrics` | Valuation metrics | symbol | `/key-metrics` |
| `useRatios` | Financial ratios (annual) | symbol | `/ratios` |
| `useRatiosTTM` | TTM financial ratios | symbol | `/ratios-ttm` |
| `useSharesFloat` | Float data | symbol | `/shares-float` |
| `useDividends` | Dividend history | symbol | `/dividends` |
| `useAnalystGrades` | Analyst ratings | symbol | `/grades` |
| `useAnalystEstimates` | EPS/revenue estimates | symbol | `/analyst-estimates` |
| `useHistoricalPrice` | OHLCV price history | symbol | `/historical-price-eod/full` |
| `useFinancialStatements` | Income, balance, cash flow | symbol, period | `/income-statement`, `/balance-sheet-statement`, `/cash-flow-statement` |
| `useScreener` | Two-tier stock screening | filters, page | `/company-screener`, `/batch-quote`, `/key-metrics-ttm`, `/ratios-ttm` |
| `useDCF` | DCF valuation | symbol | `/discounted-cash-flow` |
| `useStockPeers` | Peer companies | symbol | `/stock-peers` |
| `useKeyExecutives` | Management team | symbol | `/key-executives` |
| `useEmployeeCount` | Employee count history | symbol | `/employee-count` |
| `useStockNews` | Company & market news | symbol | `/news` |
| `useArticles` | FMP editorial articles | — | `/fmp-articles` |
| `useCommodities` | Commodity prices | — | `/quote` |
| `useWorldIndices` | Global index data | — | `/quote`, `/historical-price-eod/light` |

**`useTickerSearch` smart ranking:**
1. Exact symbol match (highest priority)
2. Symbol starts with query (US exchanges preferred)
3. Symbol contains query
4. Company name match
5. Fallback: direct quote fetch for exact ticker lookups

---

## Services Layer

**`src/services/fmp.ts`** — Single `fmp` object exposing 50+ typed methods.

All requests flow through `fetchFMP<T>()`:
1. Constructs URL with query parameters
2. Appends `apikey` from `VITE_FMP_API_KEY` environment variable
3. Starts tracking via `apiTracker.startCall()`
4. Makes `fetch()` request
5. Parses JSON response with TypeScript generic typing
6. Ends tracking via `apiTracker.endCall()`
7. Logs success/failure via `logger`
8. Enforces 150ms delay for rate limiting

---

## Utilities

### `formatters.ts`
| Function | Example Input | Example Output |
|----------|--------------|----------------|
| `formatLargeNumber(2500000000)` | 2,500,000,000 | `2.50B` |
| `formatCurrency(1234.56)` | 1234.56 | `$1,234.56` |
| `formatPercent(0.1542)` | 0.1542 | `+15.42%` |
| `formatRatio(23.456)` | 23.456 | `23.46` |
| `formatDate('2024-01-15')` | ISO string | `01/15/24` |
| `formatVolume(1500000)` | 1,500,000 | `1.50M` |

### `delay.ts`
- `delay(ms)` — Returns a Promise that resolves after `ms` milliseconds
- `API_DELAY = 150` — Default inter-call delay constant

### `logger.ts`
- **`Logger`** class — Ring buffer (100 entries), colored console output, subscriber pattern for real-time log viewing
- **`ApiTracker`** class — Tracks pending/successful/errored API calls, records data timestamps for staleness detection
- Both exported as singletons (`logger`, `apiTracker`)
- Powers the DebugPanel visible inside StockDescription

---

## Styling & Design System

The terminal uses a Bloomberg-inspired dark aesthetic with monospace typography throughout.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#0a0a0a` / `#1a1a1a` | Main background |
| `bg-secondary` | `#151515` | Card/panel backgrounds |
| `border` | `#333333` | All borders |
| `text-primary` | `#ffffff` | Primary text |
| `text-secondary` | `#cccccc` | Muted text |
| `green` | `#00c853` | Positive values, gains |
| `red` | `#ff5252` | Negative values, losses |
| `blue` | `#4dabf7` | Links, accents |
| `orange` | `#ffa726` | Warnings, highlights |

### Typography

```css
font-family: 'SF Mono', Monaco, Inconsolata, 'Fira Mono', 'Droid Sans Mono',
             'Source Code Pro', monospace;
font-size: 13px; /* base */
```

### Implementation

- **Tailwind CSS 4.1** via the Vite plugin (not PostCSS)
- **CSS custom properties** defined in `src/index.css` for theme tokens
- **`tailwind.config.js`** extends the default theme with the dark color palette
- **`darkMode: 'class'`** — Dark mode is the only mode (always active)

---

## Testing

The project uses **Vitest** with **Testing Library** for testing.

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch

# Visual UI
npm run test:ui
```

**Test configuration** (`vitest.config.ts`):
- Environment: `node` (for API integration tests)
- Timeout: 30 seconds (accounts for real API calls)
- Setup: `src/test/setup.ts`
- Test glob: `src/**/*.{test,spec}.*`

**Existing tests:**
- `src/test/fmp.test.ts` — Integration tests against the live FMP API
- `src/test/worldIndices.test.ts` — World indices hook behavior tests

---

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` pre-configured for SPA deployment.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_FMP_API_KEY
```

**`vercel.json` configuration:**
- Framework: `vite`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites: all routes → `/index.html`

### Netlify

```bash
# Build
npm run build

# Deploy via CLI
npx netlify deploy --prod --dir=dist
```

Or connect the GitHub repository for automatic deployments on push.

### Manual / Docker

```bash
# Build production assets
npm run build

# Serve the dist/ directory with any static file server
npx serve dist
# or
python3 -m http.server -d dist 8080
```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_FMP_API_KEY` | Financial Modeling Prep API key | **Yes** | — |

Create a `.env` file from the template:
```bash
cp .env.example .env
```

> **Note:** The `.env` file is gitignored and will never be committed. Never commit API keys.

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins (React, Tailwind), dev server with CSP headers (`unsafe-inline`, `unsafe-eval` for dev mode) |
| `tailwind.config.js` | Dark color palette, monospace font stack, `darkMode: 'class'` |
| `tsconfig.app.json` | Strict TypeScript — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` |
| `tsconfig.node.json` | Node-targeted TS config for build tooling |
| `vitest.config.ts` | Node test environment, 30-second timeout |
| `eslint.config.js` | ESLint 9 flat config with `typescript-eslint`, `react-hooks`, `react-refresh` plugins |
| `vercel.json` | Vercel SPA deployment configuration |
| `.env.example` | Template for required environment variables |

---

## Performance Considerations

- **Rate limiting:** 150ms delay between consecutive FMP API calls prevents hitting rate limits
- **Lazy data loading:** Screener fetches TTM metrics only after initial results load (two-tier approach)
- **No StrictMode:** React StrictMode is intentionally disabled to prevent double-firing of effects that trigger API calls
- **localStorage persistence:** Workspace state is serialized/deserialized from localStorage — no server round-trips for layout data
- **Lightweight Charts:** Uses TradingView's lightweight-charts library instead of heavier charting solutions — optimized for financial data rendering
- **Portal rendering:** Financials metric chart windows use `createPortal` to render outside their parent widget's DOM tree, avoiding overflow clipping and re-render cascades

---

## Security

- **API key isolation:** The FMP API key is stored in `.env` (gitignored) and injected at build time via Vite's `import.meta.env` — it is **not** committed to the repository
- **CSP headers:** Development server sets Content-Security-Policy headers (configured in `vite.config.ts`)
- **No server-side code:** This is a purely client-side SPA — the API key is exposed in the browser bundle. For production use, consider proxying API calls through a backend
- **SEC EDGAR:** Direct calls to SEC's public API — no authentication required

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests:
   ```bash
   npm run lint
   npm run test
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Financial Modeling Prep](https://financialmodelingprep.com) — Market data API
- [SEC EDGAR](https://www.sec.gov/edgar) — SEC filings data
- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/) — Charting library
- [react-rnd](https://github.com/bokuweb/react-rnd) — Draggable/resizable window system
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Vite](https://vitejs.dev) — Next-generation frontend tooling
- [React](https://react.dev) — UI framework
