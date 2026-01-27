# Trading Terminal

A professional-grade, Bloomberg-style trading terminal built with React, TypeScript, and Tailwind CSS. Features real-time market data, comprehensive financial analysis tools, and a draggable multi-window interface.

![Trading Terminal](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.0-purple)

## Features

- **Multi-Window Interface**: Draggable, resizable windows with snap-to-grid functionality
- **Real-Time Data**: Live quotes, news, and market data via Financial Modeling Prep API
- **Comprehensive Analysis**: Financial statements, ratios, earnings, analyst ratings
- **Market Overview**: World indices, commodities, sector performance, market movers
- **Calendars**: Earnings, IPO, dividend, stock split, and economic calendars
- **Trading Activity**: Insider trades, congressional trades, SEC filings
- **Stock Screening**: Advanced equity screener with 40+ filters

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Components](#components)
4. [API Endpoints](#api-endpoints)
5. [Hooks](#hooks)
6. [Architecture](#architecture)
7. [Deployment](#deployment)

---

## Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- FMP API Key (get one at [financialmodelingprep.com](https://financialmodelingprep.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/trading-terminal.git
cd trading-terminal

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your FMP API key to .env
# VITE_FMP_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/           # UI Components
│   ├── AnalystRatings/   # Analyst ratings & price targets
│   ├── Commodities/      # Commodity prices (gold, oil, etc.)
│   ├── Compare/          # Multi-stock comparison tool
│   ├── CongressTrades/   # Congressional trading activity
│   ├── DividendCalendar/ # Upcoming dividend dates
│   ├── Dividends/        # Dividend history & yield analysis
│   ├── DraggableWindow.tsx # Reusable draggable window wrapper
│   ├── Earnings/         # Earnings history & beat/miss analysis
│   ├── EarningsCalendar/ # Upcoming earnings dates
│   ├── EarningsMatrix/   # Quarterly earnings grid view
│   ├── EconomicCalendar/ # Economic events (Fed, GDP, etc.)
│   ├── EquityScreener/   # Advanced stock screener
│   ├── Financials/       # Income, balance sheet, cash flow
│   ├── IndexHoldings/    # S&P 500, Nasdaq 100, Dow 30 constituents
│   ├── InsiderTrades/    # Insider buying/selling activity
│   ├── IPOCalendar/      # Upcoming & recent IPOs
│   ├── MarketMovers/     # Biggest gainers/losers/most active
│   ├── News/             # Company & market news
│   ├── PressReleases/    # Company press releases
│   ├── Ratios/           # Financial ratios deep dive
│   ├── SECFilings/       # SEC EDGAR filings (10-K, 10-Q, 8-K)
│   ├── SectorPerformance/# Sector performance comparison
│   ├── SplitCalendar/    # Upcoming stock splits
│   ├── StockDescription/ # Main stock profile (chart, stats, info)
│   └── WorldEquityIndex/ # Global market indices
├── hooks/                # Custom React hooks
├── services/             # API service layer
├── types/                # TypeScript type definitions
├── utils/                # Utility functions (formatters, logger)
├── App.tsx               # Main application (window orchestration)
└── index.css             # Global styles
```

---

## Components

### Stock Description (`StockDescription/`)

The primary stock analysis window. Shows company profile, price chart, key statistics, and quick action buttons.

**Sub-components:**
| Component | Description |
|-----------|-------------|
| `InlineTickerInput` | Autocomplete ticker search |
| `PriceBar` | Current price with change % |
| `CompanyHeader` | Logo, name, sector, description |
| `PriceChart` | Interactive candlestick chart (lightweight-charts) |
| `StatsBar` | Quick stats + action buttons (FA, EM, ANR, IN, CG, DIV, Press, SEC) |
| `AnalystRatings` | Recent analyst upgrades/downgrades |
| `CompanyInfo` | DCF fair value, peers, executives, employee count |
| `SnapshotPanel` | Right sidebar with key metrics |
| `DebugPanel` | API call logging (toggle with Debug button) |

**API Endpoints Used:**
- `/profile` - Company profile
- `/quote` - Real-time quote
- `/key-metrics` - Valuation metrics
- `/ratios`, `/ratios-ttm` - Financial ratios
- `/shares-float` - Float data
- `/dividends` - Dividend history
- `/grades` - Analyst ratings
- `/analyst-estimates` - EPS/revenue estimates
- `/historical-price-eod/full` - Price history
- `/discounted-cash-flow` - DCF valuation
- `/stock-peers` - Similar companies
- `/key-executives` - Management team
- `/employee-count` - Employee history

---

### Equity Screener (`EquityScreener/`)

Advanced stock screening tool with Finviz-style filtering across descriptive, fundamental, and technical categories.

**Sub-components:**
| Component | Description |
|-----------|-------------|
| `FilterTabs` | Tab navigation (Descriptive/Fundamental/Technical) |
| `FilterPanel` | Grid of filter controls |
| `RangeSlider` | Min/max numeric range slider |
| `SelectFilter` | Dropdown multi-select |
| `ActiveFilters` | Removable filter chips |
| `ScreenerTable` | Results table with sorting |
| `SparklineChart` | Mini 30-day price chart |
| `Pagination` | Page navigation |

**Filters Available:**
- **Descriptive**: Sector, Industry, Country, Exchange, Market Cap, Price, Volume, Beta, Dividend Yield, ETF/Fund toggle
- **Fundamental**: P/E, P/B, EV/EBITDA, ROE, ROA, ROIC, Current Ratio, Debt/Equity, Margins
- **Technical**: Price vs SMA50/SMA200, 52-Week High/Low proximity

**API Endpoints Used:**
- `/company-screener` - Server-side filtering (primary)
- `/batch-quote` - Quote data for results
- `/key-metrics-ttm` - Fundamental metrics (lazy-loaded)
- `/ratios-ttm` - Financial ratios (lazy-loaded)

---

### Financials (`Financials/`)

Full financial statements with annual/quarterly toggle and YoY growth calculations.

**Features:**
- Income Statement with revenue, gross profit, operating income, net income
- Balance Sheet with assets, liabilities, equity
- Cash Flow Statement with operating, investing, financing activities
- Automatic YoY growth % calculation
- Sparkline trends for each line item

**API Endpoints Used:**
- `/income-statement` - Income statement data
- `/balance-sheet-statement` - Balance sheet data
- `/cash-flow-statement` - Cash flow data

---

### Analyst Ratings (`AnalystRatings/`)

Comprehensive analyst coverage view with consensus rating and price targets.

**Features:**
- Consensus rating calculation (Strong Buy to Strong Sell)
- Price target range visualization (low/consensus/high)
- Current price position on target range bar
- Upside/downside % calculation
- Full rating history table with firm names and grade changes

**API Endpoints Used:**
- `/grades` - Analyst ratings history
- `/price-target-consensus` - Price target summary
- `/quote` - Current price

---

### Earnings (`Earnings/`)

Historical earnings performance with beat/miss analysis.

**Features:**
- EPS actual vs estimate comparison
- Beat/miss/meet classification
- Surprise % calculation
- Revenue actual vs estimate
- Historical trend visualization

**API Endpoints Used:**
- `/earnings` - Earnings history

---

### Earnings Matrix (`EarningsMatrix/`)

Quarterly earnings grid showing Q1-Q4 across multiple years.

**Features:**
- Matrix view (years as rows, quarters as columns)
- Revenue and EPS for each quarter
- YoY growth comparison
- Beat/miss highlighting

**API Endpoints Used:**
- `/earnings` - Earnings data
- `/analyst-estimates` - Future estimates

---

### Dividends (`Dividends/`)

Dividend history and yield analysis.

**Features:**
- Dividend yield calculation
- Ex-dividend dates
- Payment frequency
- Dividend growth rate
- Payout ratio

**API Endpoints Used:**
- `/dividends` - Dividend history
- `/quote` - Current price for yield calculation

---

### Ratios (`Ratios/`)

Deep dive into financial ratios with historical comparison.

**Features:**
- Valuation ratios (P/E, P/B, P/S, EV/EBITDA)
- Profitability ratios (ROE, ROA, ROIC, margins)
- Liquidity ratios (Current, Quick)
- Leverage ratios (Debt/Equity, Interest Coverage)
- Efficiency ratios (Asset Turnover, Inventory Turnover)

**API Endpoints Used:**
- `/ratios` - Annual ratios
- `/ratios-ttm` - Trailing twelve months ratios
- `/key-metrics` - Valuation metrics

---

### News (`News/`)

Company-specific and market-wide news aggregator.

**Features:**
- Symbol-filtered news
- General market news tab
- FMP articles tab
- Source attribution
- Time-relative formatting

**API Endpoints Used:**
- `/news?symbol=` - Company news
- `/news/stock-latest` - Latest stock news
- `/news/general-latest` - General market news
- `/fmp-articles` - FMP editorial content

---

### Press Releases (`PressReleases/`)

Company press releases and announcements.

**Features:**
- Chronological listing
- Source company filtering
- Title and date display

**API Endpoints Used:**
- `/news?symbol=` (filtered for press releases)

---

### SEC Filings (`SECFilings/`)

SEC EDGAR filings browser.

**Features:**
- Form type filtering (10-K, 10-Q, 8-K, Proxy, Insider, Registration)
- Color-coded form types
- Direct links to SEC.gov documents
- Company CIK lookup
- Filing date and size display
- Year-by-year filing summary

**API Endpoints Used:**
- `/profile` - Get company CIK
- SEC EDGAR API: `https://data.sec.gov/submissions/CIK{cik}.json`

---

### Insider Trades (`InsiderTrades/`)

Corporate insider buying and selling activity.

**Features:**
- Transaction type (Buy/Sell/Award)
- Insider name and title
- Shares and value
- Date filtering
- Latest trades across all symbols

**API Endpoints Used:**
- `/insider-trading/search?symbol=` - Symbol-specific trades
- `/insider-trading/latest` - Latest insider trades
- `/insider-trading/statistics` - Insider statistics

---

### Congress Trades (`CongressTrades/`)

Congressional trading activity (House of Representatives).

**Features:**
- Representative name and party
- Transaction type (Buy/Sell)
- Estimated value range
- Disclosure date

**API Endpoints Used:**
- `/house-trades?symbol=` - House trading activity

---

### World Equity Index (`WorldEquityIndex/`)

Global market indices overview.

**Features:**
- Major indices (S&P 500, Dow, Nasdaq, Russell)
- European indices (FTSE, DAX, CAC, Euro Stoxx)
- Asian indices (Nikkei, Hang Seng, Shanghai)
- Price and change % with color coding
- Period performance (1D, 1W, 1M, YTD, 1Y)

**API Endpoints Used:**
- `/quote?symbol=` - Index quotes
- `/historical-price-eod/light` - Historical prices for period calculations

---

### Commodities (`Commodities/`)

Commodity prices and performance.

**Features:**
- Precious metals (Gold, Silver, Platinum)
- Energy (Crude Oil, Natural Gas, Heating Oil)
- Agriculture (Corn, Wheat, Soybeans, Coffee, Sugar)
- Industrial metals (Copper, Aluminum)
- Live prices with change %

**API Endpoints Used:**
- `/quote?symbol=` - Commodity quotes

---

### Market Movers (`MarketMovers/`)

Daily biggest gainers, losers, and most active stocks.

**Features:**
- Top gainers by % change
- Top losers by % change
- Most active by volume
- Click to open stock description

**API Endpoints Used:**
- `/biggest-gainers` - Top gainers
- `/biggest-losers` - Top losers
- `/most-active` - Most active by volume

---

### Sector Performance (`SectorPerformance/`)

Sector-by-sector market performance.

**Features:**
- All 11 GICS sectors
- Daily performance ranking
- Period comparison (1W, 1M, 3M, YTD, 1Y)
- Color-coded performance bars

**API Endpoints Used:**
- `/quote?symbol=` - Sector ETF quotes (XLK, XLF, XLE, etc.)
- `/historical-price-eod/light` - Historical performance

---

### Index Holdings (`IndexHoldings/`)

Index constituent browser.

**Features:**
- S&P 500, Nasdaq 100, Dow Jones 30
- Sortable by name, weight, sector
- Sector distribution pie chart
- Click to open stock description

**API Endpoints Used:**
- `/sp500-constituent` - S&P 500 holdings
- `/nasdaq-constituent` - Nasdaq 100 holdings
- `/dowjones-constituent` - Dow 30 holdings

---

### Earnings Calendar (`EarningsCalendar/`)

Upcoming and recent earnings dates.

**Features:**
- Week view navigation
- Before/After market time indicators
- EPS estimate display
- Click to open stock description

**API Endpoints Used:**
- `/earnings-calendar?from=&to=` - Earnings dates

---

### IPO Calendar (`IPOCalendar/`)

IPO tracking and upcoming offerings.

**Features:**
- Upcoming IPOs with expected dates
- Recent IPOs with pricing info
- Exchange and price range
- Deal size estimates

**API Endpoints Used:**
- `/ipos-calendar?from=&to=` - IPO dates

---

### Split Calendar (`SplitCalendar/`)

Stock split tracker.

**Features:**
- Upcoming splits
- Split ratio display
- Effective dates

**API Endpoints Used:**
- `/splits-calendar?from=&to=` - Split dates

---

### Dividend Calendar (`DividendCalendar/`)

Ex-dividend date tracker.

**Features:**
- Upcoming ex-dividend dates
- Dividend amount and yield
- Record and payment dates

**API Endpoints Used:**
- `/dividends-calendar?from=&to=` - Dividend dates

---

### Economic Calendar (`EconomicCalendar/`)

Economic events and indicators.

**Features:**
- Fed meetings, GDP, Jobs reports
- CPI, Retail Sales, Housing data
- Actual vs Estimate vs Previous
- Impact level indicator
- Country filtering

**API Endpoints Used:**
- `/economic-calendar?from=&to=` - Economic events

---

### Compare (`Compare/`)

Multi-stock comparison tool.

**Features:**
- Side-by-side metrics comparison
- Up to 5 stocks simultaneously
- Price, valuation, profitability metrics
- Relative performance chart

**API Endpoints Used:**
- `/quote` - Current prices
- `/key-metrics` - Comparison metrics
- `/ratios` - Financial ratios

---

## API Endpoints

All API calls go through the FMP (Financial Modeling Prep) service at `https://financialmodelingprep.com/stable`.

### Complete Endpoint Reference

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Company Info** | `/profile?symbol=` | Company profile, logo, description |
| | `/quote?symbol=` | Real-time quote |
| | `/search-name?query=` | Ticker search autocomplete |
| **Financials** | `/income-statement?symbol=` | Income statement |
| | `/balance-sheet-statement?symbol=` | Balance sheet |
| | `/cash-flow-statement?symbol=` | Cash flow statement |
| **Metrics** | `/key-metrics?symbol=` | Key valuation metrics |
| | `/key-metrics-ttm?symbol=` | TTM valuation metrics |
| | `/ratios?symbol=` | Financial ratios |
| | `/ratios-ttm?symbol=` | TTM financial ratios |
| **Analyst** | `/grades?symbol=` | Analyst ratings |
| | `/analyst-estimates?symbol=` | EPS/revenue estimates |
| | `/price-target-consensus?symbol=` | Price targets |
| **Historical** | `/historical-price-eod/full?symbol=` | Full OHLCV history |
| | `/historical-price-eod/light?symbol=` | Light price history |
| | `/earnings?symbol=` | Earnings history |
| | `/dividends?symbol=` | Dividend history |
| **News** | `/news?symbol=` | Company news |
| | `/news/stock-latest` | Latest stock news |
| | `/news/general-latest` | General market news |
| | `/fmp-articles` | FMP articles |
| **Trading Activity** | `/insider-trading/search?symbol=` | Insider trades |
| | `/insider-trading/latest` | Latest insider trades |
| | `/house-trades?symbol=` | Congressional trades |
| **Company Analysis** | `/discounted-cash-flow?symbol=` | DCF valuation |
| | `/stock-peers?symbol=` | Similar companies |
| | `/key-executives?symbol=` | Management team |
| | `/employee-count?symbol=` | Employee history |
| | `/shares-float?symbol=` | Float data |
| **Screener** | `/company-screener` | Stock screener |
| | `/batch-quote?symbols=` | Batch quotes |
| **Calendars** | `/earnings-calendar` | Earnings dates |
| | `/ipos-calendar` | IPO dates |
| | `/splits-calendar` | Split dates |
| | `/dividends-calendar` | Dividend dates |
| | `/economic-calendar` | Economic events |
| **Market Data** | `/biggest-gainers` | Top gainers |
| | `/biggest-losers` | Top losers |
| | `/most-active` | Most active |
| **Index Constituents** | `/sp500-constituent` | S&P 500 holdings |
| | `/nasdaq-constituent` | Nasdaq 100 holdings |
| | `/dowjones-constituent` | Dow 30 holdings |

### External APIs

| Source | Endpoint | Description |
|--------|----------|-------------|
| SEC EDGAR | `https://data.sec.gov/submissions/CIK{cik}.json` | SEC filings |

---

## Hooks

Custom React hooks for data fetching and state management.

| Hook | Description | API Endpoints Used |
|------|-------------|-------------------|
| `useCompanyProfile` | Company profile data | `/profile` |
| `useQuote` | Real-time quote | `/quote` |
| `useKeyMetrics` | Valuation metrics | `/key-metrics` |
| `useRatios` | Financial ratios | `/ratios` |
| `useRatiosTTM` | TTM ratios | `/ratios-ttm` |
| `useAnalystGrades` | Analyst ratings | `/grades` |
| `useAnalystEstimates` | EPS estimates | `/analyst-estimates` |
| `useHistoricalPrice` | Price history | `/historical-price-eod/full` |
| `useDividends` | Dividend history | `/dividends` |
| `useSharesFloat` | Float data | `/shares-float` |
| `useDCF` | DCF valuation | `/discounted-cash-flow` |
| `useStockPeers` | Similar companies | `/stock-peers` |
| `useKeyExecutives` | Management team | `/key-executives` |
| `useEmployeeCount` | Employee history | `/employee-count` |
| `useArticles` | Market articles | `/fmp-articles` |
| `useStockNews` | Stock news | `/news` |
| `useFinancialStatements` | Financial statements | `/income-statement`, `/balance-sheet-statement`, `/cash-flow-statement` |
| `useTickerSearch` | Autocomplete search | `/search-name` |
| `useWorldIndices` | Global indices | `/quote`, `/historical-price-eod/light` |
| `useCommodities` | Commodity prices | `/quote` |
| `useScreener` | Stock screener | `/company-screener`, `/batch-quote`, `/key-metrics-ttm` |

---

## Architecture

### State Management

The application uses React's built-in state management with `useState` and `useCallback` hooks. Each window maintains its own local state, with cross-window communication handled through callback props in `App.tsx`.

```
App.tsx (Window Orchestration)
├── Window States (showDescription, showFinancials, etc.)
├── Symbol States (descriptionSymbol, financialsSymbol, etc.)
├── Header States (descriptionHeader, financialsHeader, etc.)
├── Open Handlers (handleOpenDescription, handleOpenFinancials, etc.)
└── DraggableWindow Components
    └── Child Components with onSymbolChange callbacks
```

### Data Flow

```
User Action -> Hook (useXxx) -> FMP Service -> API Call -> State Update -> Re-render
                                    |
                              Rate Limiting (150ms delay)
                                    |
                              Logging (apiTracker)
```

### Window System

The `DraggableWindow` component wraps all content windows, providing:
- Drag functionality via title bar
- Resize via corner/edge handles
- Minimize/maximize (planned)
- Close button
- Z-index management for focus

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_FMP_API_KEY
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy via Netlify CLI
npx netlify deploy --prod --dir=dist
```

Or connect your GitHub repository to Netlify and it will auto-deploy on push.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FMP_API_KEY` | Financial Modeling Prep API key | Yes |

---

## API Rate Limits

FMP API has rate limits based on subscription tier:

| Tier | Calls/Minute | Recommended Use |
|------|--------------|-----------------|
| Free | 5 | Development only |
| Starter | 100 | Light usage |
| Essential | 300 | This application |
| Premium | 750 | High-frequency |

The application includes a 150ms delay between API calls to respect rate limits.

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Acknowledgments

- [Financial Modeling Prep](https://financialmodelingprep.com) - Market data API
- [SEC EDGAR](https://www.sec.gov/edgar) - SEC filings data
- [Lightweight Charts](https://www.tradingview.com/lightweight-charts/) - Charting library
- [React RND](https://github.com/bokuweb/react-rnd) - Draggable/resizable windows
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
