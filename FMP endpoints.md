# FMP API Endpoints Documentation

<!-- Paste your FMP endpoints documentation below this line -->

# Financial Modeling Prep (FMP) API Documentation

## Overview

Financial Modeling Prep (FMP) provides a comprehensive Stock Market API and Financial Data API with 263+ endpoints across 28 categories. The API offers real-time stock prices, financial statements, historical data, and more.

**Base URL:** `https://financialmodelingprep.com/stable/`

---

## Authentication

All API requests require an API key for authorization. Two methods available:

### Header Authorization
```
apikey: YOUR_API_KEY
```

### URL Query Authorization
```
?apikey=YOUR_API_KEY
```

**Note:** When adding the API key to requests with existing query parameters, use `&apikey=` instead of `?apikey=`

---

## Pricing Plans

| Plan | Price | API Calls | Historical Data | Coverage | Key Features |
|------|-------|-----------|-----------------|----------|--------------|
| **Basic** | Free | 250/day | End of Day | Limited | 150+ endpoints, testing |
| **Starter** | $19/mo | 300/min | 5 years | US | Annual fundamentals, Crypto/Forex |
| **Premium** | $49/mo | 750/min | 30 years | US, UK, Canada | Intraday charts, Technical indicators |
| **Ultimate** | $99/mo | 3000/min | Full | Global | Earnings transcripts, 13F, Bulk data |

---

## Coverage Icons

- 🌐 **Globe Flag** = Global coverage (worldwide companies)
- 🇺🇸 **USA Flag** = US only coverage
- 🔒 **Limited Access** = Parameter requires higher plan tier

---

## API Categories & Endpoints

### 1. Company Search

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Stock Symbol Search API** | 🌐 Global | Find ticker symbols by searching partial symbols |
| **Company Name Search API** | 🌐 Global | Search by company name to find ticker symbols |
| **CIK API** | 🇺🇸 US Only | Retrieve Central Index Key for SEC filings |
| **CUSIP API** | 🌐 Global | Search securities by CUSIP number |
| **ISIN API** | 🌐 Global | Search by International Securities ID Number |
| **Stock Screener API** | 🌐 Global | Filter stocks by market cap, price, volume, beta, sector |
| **Exchange Variants API** | 🌐 Global | Get different exchange listings for a symbol |

#### Stock Symbol Search API
```
GET /stable/search-symbol?query=AAPL
```
| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| query | string | Yes* | AAPL |
| limit | number | No | 50 |
| exchange | string | No | NASDAQ |

**Response:**
```json
[{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "currency": "USD",
  "exchangeFullName": "NASDAQ Global Select",
  "exchange": "NASDAQ"
}]
```

#### Stock Screener API
```
GET /stable/company-screener
```
| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| marketCapMoreThan | number | 1000000 | |
| marketCapLowerThan | number | 1000000000 | |
| sector | string | Technology | |
| industry | string | Consumer Electronics | |
| betaMoreThan | number | 0.5 | |
| betaLowerThan | number | 1.5 | |
| priceMoreThan | number | 10 | |
| priceLowerThan | number | 200 | |
| dividendMoreThan | number | 0.5 | |
| dividendLowerThan | number | 2 | |
| volumeMoreThan | number | 1000 | |
| volumeLowerThan | number | 1000000 | |
| exchange | string | NASDAQ | 🔒 Limited Access |
| country | string | US | |
| isEtf | boolean | false | |
| isFund | boolean | false | |
| isActivelyTrading | boolean | true | |
| limit | number | 1000 | |

---

### 2. Stock Directory

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Company Symbols List API** | 🌐 Global | Get all available stock symbols |
| **Financial Statement Symbols List API** | 🌐 Global | Symbols with financial statements available |
| **CIK List API** | 🇺🇸 US Only | List of all CIK numbers |
| **Symbol Changes List API** | 🇺🇸 US Only | Track symbol/ticker changes |
| **ETF Symbol Search API** | 🌐 Global | List of all ETF symbols |
| **Actively Trading List API** | 🌐 Global | Currently trading securities |
| **Earnings Transcript List API** | 🇺🇸 US Only | Symbols with earnings transcripts |
| **Available Exchanges API** | 🌐 Global | List of supported exchanges |
| **Available Sectors API** | - | List of market sectors |
| **Available Industries API** | - | List of industries |
| **Available Countries API** | - | List of supported countries |

---

### 3. Company Information

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Company Profile Data API** | 🌐 Global | Comprehensive company info, description, CEO |
| **Company Profile by CIK API** | 🇺🇸 US Only | Profile lookup by CIK number |
| **Company Notes API** | 🌐 Global | Company notes and annotations |
| **Stock Peer Comparison API** | 🌐 Global | Compare with peer companies |
| **Delisted Companies API** | 🌐 Global | List of delisted companies |
| **Company Employee Count API** | 🌐 Global | Current employee count |
| **Company Historical Employee Count API** | 🌐 Global | Historical employee data |
| **Company Market Cap API** | 🌐 Global | Current market capitalization |
| **Batch Market Cap API** | 🌐 Global | Market cap for multiple symbols |
| **Historical Market Cap API** | 🌐 Global | Historical market cap data |
| **Company Share Float & Liquidity API** | 🌐 Global | Shares float and liquidity metrics |
| **All Shares Float API** | 🌐 Global | Float data for all companies |
| **Latest Mergers & Acquisitions API** | 🌐 Global | Recent M&A activity |
| **Search Mergers & Acquisitions API** | 🌐 Global | Search M&A by company name |
| **Company Executives API** | 🌐 Global | Key executives information |
| **Executive Compensation API** | 🇺🇸 US Only | Executive pay details |
| **Executive Compensation Benchmark API** | 🌐 Global | Compensation benchmarks |

#### Company Profile API
```
GET /stable/profile?symbol=AAPL
```
Returns: symbol, price, beta, volAvg, mktCap, lastDiv, range, changes, companyName, currency, cik, isin, cusip, exchange, exchangeShortName, industry, website, description, ceo, sector, country, fullTimeEmployees, phone, address, city, state, zip, dcfDiff, dcf, image, ipoDate, defaultImage, isEtf, isActivelyTrading, isAdr, isFund

---

### 4. Quote

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Stock Quote API** | 🌐 Global | Full real-time stock quote |
| **Stock Quote Short API** | 🌐 Global | Simplified quote (price, volume, change) |
| **Aftermarket Trade API** | 🌐 Global | After-hours trading data |
| **Aftermarket Quote API** | 🌐 Global | After-hours quote |
| **Stock Price Change API** | 🌐 Global | Price change percentages |
| **Stock Batch Quote API** | 🌐 Global | Multiple quotes in one request |
| **Stock Batch Quote Short API** | 🌐 Global | Multiple simplified quotes |
| **Batch Aftermarket Trade API** | 🌐 Global | Batch after-hours trades |
| **Batch Aftermarket Quote API** | 🌐 Global | Batch after-hours quotes |
| **Exchange Stock Quotes API** | 🌐 Global | All quotes for an exchange |
| **Mutual Fund Price Quotes API** | 🌐 Global | Mutual fund pricing |
| **ETF Price Quotes API** | 🌐 Global | ETF pricing |
| **Full Commodities Quotes API** | 🌐 Global | Commodities quotes |
| **Full Cryptocurrency Quotes API** | 🌐 Global | Crypto quotes |
| **Full Forex Quote API** | 🌐 Global | Forex pair quotes |
| **Full Index Quotes API** | 🌐 Global | Market index quotes |

#### Stock Quote API
```
GET /stable/quote?symbol=AAPL
```

---

### 5. Financial Statements

**Note:** Maximum 1000 records per request. Currency is as reported in financials.

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Income Statement API** | 🌐 Global | Revenue, expenses, net income |
| **Balance Sheet Statement API** | 🌐 Global | Assets, liabilities, equity |
| **Cash Flow Statement API** | 🌐 Global | Operating, investing, financing flows |
| **Latest Financial Statements API** | 🌐 Global | Most recent statements |
| **Income Statements TTM API** | 🌐 Global | Trailing twelve months income |
| **Balance Sheet Statements TTM API** | 🌐 Global | TTM balance sheet |
| **Cashflow Statements TTM API** | 🌐 Global | TTM cash flow |
| **Key Metrics API** | 🌐 Global | Key financial metrics |
| **Financial Ratios API** | 🌐 Global | Financial ratios analysis |
| **Key Metrics TTM API** | 🌐 Global | TTM key metrics |
| **Financial Ratios TTM API** | 🌐 Global | TTM ratios |
| **Financial Scores API** | 🌐 Global | Altman Z-Score, Piotroski |
| **Owner Earnings API** | 🌐 Global | Warren Buffett's owner earnings |
| **Enterprise Values API** | 🌐 Global | Enterprise value calculations |
| **Income Statement Growth API** | 🌐 Global | YoY income growth |
| **Balance Sheet Statement Growth API** | 🌐 Global | YoY balance sheet growth |
| **Cashflow Statement Growth API** | 🌐 Global | YoY cash flow growth |
| **Financial Statement Growth API** | 🌐 Global | Combined growth metrics |
| **Financial Reports Dates API** | 🇺🇸 US Only | Filing dates |
| **Financial Reports Form 10-K JSON API** | 🇺🇸 US Only | 10-K in JSON format |
| **Financial Reports Form 10-K XLSX API** | 🇺🇸 US Only | 10-K in Excel format |
| **Revenue Product Segmentation API** | 🌐 Global | Revenue by product |
| **Revenue Geographic Segments API** | 🌐 Global | Revenue by geography |
| **As Reported Income Statements API** | 🇺🇸 US Only | SEC filed income statements |
| **As Reported Balance Statements API** | 🇺🇸 US Only | SEC filed balance sheets |
| **As Reported Cashflow Statements API** | 🇺🇸 US Only | SEC filed cash flows |
| **As Reported Financial Statements API** | 🇺🇸 US Only | All SEC filed statements |

#### Income Statement API
```
GET /stable/income-statement?symbol=AAPL
```
| Parameter | Type | Required | Example | Notes |
|-----------|------|----------|---------|-------|
| symbol | string | Yes* | AAPL | 🔒 Limited Access |
| limit | number | No | 5 | 🔒 Limited Access |
| period | string | No | Q1,Q2,Q3,Q4,FY,annual,quarter | |

---

### 6. Charts (Historical Price Data)

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Stock Chart Light API** | 🌐 Global | Lightweight daily OHLCV |
| **Stock Price and Volume Data API** | 🌐 Global | Full historical daily data |
| **Unadjusted Stock Price API** | 🌐 Global | Non-split-adjusted prices |
| **Dividend Adjusted Price Chart API** | 🌐 Global | Dividend-adjusted prices |
| **1 Min Interval Stock Chart API** | 🌐 Global | 1-minute candles (Premium+) |
| **5 Min Interval Stock Chart API** | 🌐 Global | 5-minute candles |
| **15 Min Interval Stock Chart API** | 🌐 Global | 15-minute candles |
| **30 Min Interval Stock Chart API** | 🌐 Global | 30-minute candles |
| **1 Hour Interval Stock Chart API** | 🌐 Global | 1-hour candles |
| **4 Hour Interval Stock Chart API** | 🌐 Global | 4-hour candles |

---

### 7. Economics

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Treasury Rates API** | - | US Treasury rates |
| **Economics Indicators API** | - | GDP, CPI, unemployment, etc. |
| **Economic Data Releases Calendar API** | - | Upcoming economic releases |
| **Market Risk Premium API** | - | Equity risk premium data |

---

### 8. Earnings, Dividends, Splits

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Dividends Company API** | 🌐 Global | Company dividend history |
| **Dividends Calendar API** | 🌐 Global | Upcoming ex-dividend dates |
| **Earnings Report API** | 🌐 Global | Historical earnings reports |
| **Earnings Calendar API** | 🌐 Global | Upcoming earnings dates |
| **IPOs Calendar API** | 🌐 Global | Upcoming and recent IPOs |
| **IPOs Disclosure API** | 🇺🇸 US Only | IPO SEC disclosures |
| **IPOs Prospectus API** | 🌐 Global | IPO prospectus data |
| **Stock Split Details API** | 🌐 Global | Historical stock splits |
| **Stock Split Calendar API** | 🌐 Global | Upcoming stock splits |

---

### 9. Earnings Transcript

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Earnings Call Transcript API** | 🇺🇸 US Only | Full earnings call transcripts |
| **Earnings Call Transcript By Year API** | 🇺🇸 US Only | Transcripts by fiscal year |
| **Batch Earnings Call Transcript API** | 🇺🇸 US Only | Multiple transcripts at once |

---

### 10. News

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Stock News API** | 🌐 Global | Company-specific news |
| **Stock News Sentiment API** | 🌐 Global | News with sentiment analysis |
| **General Latest News API** | 🌐 Global | Latest market news |
| **Press Releases API** | 🌐 Global | Company press releases |
| **Crypto News API** | 🌐 Global | Cryptocurrency news |
| **Forex News API** | 🌐 Global | Currency market news |

---

### 11. Form 13F (Institutional Holdings)

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **13F Holdings by CIK API** | 🇺🇸 US Only | Fund holdings by CIK |
| **13F Holdings By Fund Name API** | 🇺🇸 US Only | Holdings by fund name |
| **Institutional Holder List API** | 🇺🇸 US Only | List of institutional holders |
| **Institutional Holders of Symbol API** | 🇺🇸 US Only | Who holds a specific stock |
| **Institutional Holdings of Symbol API** | 🇺🇸 US Only | Detailed holdings data |
| **Institutional Holdings Portfolio Summary API** | 🇺🇸 US Only | Portfolio summary |
| **Institutional Holdings Portfolio Dates API** | 🇺🇸 US Only | Portfolio reporting dates |
| **Institutional Holdings Portfolio Composition API** | 🇺🇸 US Only | Portfolio breakdown |
| **Institutional Holdings Portfolio Sector Summary API** | 🇺🇸 US Only | Sector allocation |
| **Institutional Holdings Portfolio Industry Summary API** | 🇺🇸 US Only | Industry allocation |

---

### 12. Analyst

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Analyst Estimates API** | 🌐 Global | EPS and revenue estimates |
| **Analyst Recommendations API** | 🌐 Global | Buy/sell/hold recommendations |
| **Price Target API** | 🌐 Global | Analyst price targets |
| **Price Target Summary API** | 🌐 Global | Consensus price target |
| **Price Target by Analyst API** | 🌐 Global | Individual analyst targets |
| **Price Target by Company API** | 🌐 Global | All targets for a company |
| **Price Target Consensus API** | 🌐 Global | Consensus target |
| **Price Target Latest News API** | 🌐 Global | Recent target changes |
| **Upgrades Downgrades API** | 🌐 Global | Rating changes |
| **Upgrades Downgrades Consensus API** | 🌐 Global | Consensus rating |
| **Upgrades Downgrades by Company API** | 🌐 Global | Company-specific changes |

---

### 13. Market Performance

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Sector Performance API** | 🌐 Global | Sector returns |
| **Sector Historical Data API** | 🌐 Global | Historical sector performance |
| **Market Biggest Gainers API** | 🌐 Global | Top gaining stocks |
| **Market Biggest Losers API** | 🌐 Global | Top losing stocks |
| **Market Most Active API** | 🌐 Global | Most traded stocks |
| **Pre-Market Gainers API** | 🇺🇸 US Only | Pre-market movers up |
| **Pre-Market Losers API** | 🇺🇸 US Only | Pre-market movers down |
| **Pre-Market Most Active API** | 🇺🇸 US Only | Pre-market active stocks |
| **After-Hours Gainers API** | 🇺🇸 US Only | After-hours movers up |
| **After-Hours Losers API** | 🇺🇸 US Only | After-hours movers down |
| **After-Hours Most Active API** | 🇺🇸 US Only | After-hours active stocks |

---

### 14. Technical Indicators

All technical indicators support multiple timeframes: 1min, 5min, 15min, 30min, 1hour, 4hour, daily

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Simple Moving Average API** | 🌐 Global | SMA calculation |
| **Exponential Moving Average API** | 🌐 Global | EMA calculation |
| **Weighted Moving Average API** | 🌐 Global | WMA calculation |
| **Double Exponential Moving Average API** | 🌐 Global | DEMA calculation |
| **Triple Exponential Moving Average API** | 🌐 Global | TEMA calculation |
| **Williams %R API** | 🌐 Global | Williams %R indicator |
| **Relative Strength Index API** | 🌐 Global | RSI calculation |
| **Average Directional Index API** | 🌐 Global | ADX indicator |
| **Standard Deviation API** | 🌐 Global | Volatility measure |

#### Technical Indicator API Example
```
GET /stable/technical-indicators/sma?symbol=AAPL&periodLength=10&timeframe=1day
```
| Parameter | Type | Required | Example | Notes |
|-----------|------|----------|---------|-------|
| symbol | string | Yes* | AAPL | 🔒 Limited Access |
| periodLength | number | Yes* | 10 | |
| timeframe | string | Yes* | 1min,5min,15min,30min,1hour,4hour,1day | 🔒 Limited Access |
| from | date | No | 2025-09-09 | |
| to | date | No | 2025-12-09 | |

---

### 15. ETF & Mutual Funds

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **ETF Holdings API** | 🌐 Global | ETF constituent holdings |
| **ETF Holdings By Date API** | 🌐 Global | Historical ETF holdings |
| **ETF Information API** | 🌐 Global | ETF details and expense ratio |
| **ETF Sector Weighting API** | 🌐 Global | ETF sector allocation |
| **ETF Country Weighting API** | 🌐 Global | ETF geographic allocation |
| **ETF Stock Exposure API** | 🌐 Global | Stock's ETF exposure |
| **Mutual Fund Holdings API** | 🌐 Global | Mutual fund constituents |
| **Mutual Fund Holdings By Date API** | 🌐 Global | Historical fund holdings |

---

### 16. SEC Filings

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **SEC Filings API** | 🇺🇸 US Only | Company SEC filings |
| **SEC RSS Feed API** | 🇺🇸 US Only | Real-time SEC filing feed |
| **SEC 8-K Filing Dates API** | 🇺🇸 US Only | 8-K filing history |
| **SEC EDGAR Filing API** | 🇺🇸 US Only | EDGAR database access |
| **Individual Industry Classification API** | 🇺🇸 US Only | SIC codes |

---

### 17. Insider Trades

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Insider Trades API** | 🇺🇸 US Only | Insider buying/selling |
| **Insider Trades by Symbol API** | 🇺🇸 US Only | Company-specific insider trades |
| **Insider Trades RSS Feed API** | 🇺🇸 US Only | Real-time insider trade feed |
| **Insider Trades Statistics API** | 🇺🇸 US Only | Aggregate insider activity |
| **Beneficial Ownership CIK API** | 🇺🇸 US Only | Beneficial owner CIK lookup |
| **Beneficial Ownership by CIK API** | 🇺🇸 US Only | Ownership by CIK |
| **Fails to Deliver API** | 🇺🇸 US Only | Fails to deliver data |

---

### 18. Indexes

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Major Index List API** | 🌐 Global | All major market indexes |
| **Major Index Quote API** | 🌐 Global | Real-time index quotes |
| **Major Index Historical Data API** | 🌐 Global | Historical index data |
| **S&P 500 Constituents API** | 🌐 Global | S&P 500 components |
| **Nasdaq Constituents API** | 🌐 Global | Nasdaq 100 components |
| **Dow Jones Constituents API** | 🌐 Global | Dow 30 components |
| **Historical S&P 500 Constituents API** | 🌐 Global | S&P 500 historical changes |
| **Historical Nasdaq Constituents API** | 🌐 Global | Nasdaq historical changes |
| **Historical Dow Jones Constituents API** | 🌐 Global | Dow historical changes |

---

### 19. Market Hours

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Market Hours API** | 🌐 Global | Exchange trading hours |
| **Market Holiday API** | 🌐 Global | Market holidays |

---

### 20. Commodity

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Full Commodities Quote API** | 🌐 Global | All commodities quotes |
| **Commodities List API** | 🌐 Global | Available commodities |
| **Commodities Historical Data API** | 🌐 Global | Historical commodity prices |
| **Commodities Intraday Data API** | 🌐 Global | Intraday commodity data |

---

### 21. Discounted Cash Flow

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Discounted Cash Flow API** | 🌐 Global | DCF valuation |
| **Advanced DCF API** | 🌐 Global | Detailed DCF model |
| **Levered DCF API** | 🌐 Global | Levered DCF calculation |
| **Historical Discounted Cash Flow API** | 🌐 Global | Historical DCF values |
| **Historical Daily Discounted Cash Flow API** | 🌐 Global | Daily DCF history |

---

### 22. Forex

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Forex List API** | 🌐 Global | Available forex pairs |
| **Full Forex Quotes API** | 🌐 Global | All forex pair quotes |
| **Forex Historical Data API** | 🌐 Global | Historical forex rates |
| **Forex Intraday Data API** | 🌐 Global | Intraday forex data |

---

### 23. Cryptocurrency

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Crypto List API** | 🌐 Global | Available cryptocurrencies |
| **Full Crypto Quotes API** | 🌐 Global | All crypto quotes |
| **Crypto Historical Data API** | 🌐 Global | Historical crypto prices |
| **Crypto Intraday Data API** | 🌐 Global | Intraday crypto data |

---

### 24. Senate (Congressional Trading)

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Senate Latest Trading API** | 🇺🇸 US Only | Recent Senate trades |
| **Senate Trading by Name API** | 🇺🇸 US Only | Trades by Senator |
| **Senate Disclosure API** | 🇺🇸 US Only | Senate financial disclosures |
| **Senate Disclosure RSS API** | 🇺🇸 US Only | Real-time disclosure feed |
| **Latest House Financial Disclosures API** | 🇺🇸 US Only | House member disclosures |
| **U.S. House Trades API** | 🇺🇸 US Only | House member trades |

---

### 25. ESG (Environmental, Social, Governance)

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **ESG Score API** | 🌐 Global | Company ESG scores |
| **ESG Risk Rating API** | 🌐 Global | ESG risk assessment |
| **ESG Benchmark API** | 🌐 Global | ESG sector benchmarks |

---

### 26. Commitment of Traders

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Commitment of Traders List API** | 🌐 Global | Available COT reports |
| **Commitment of Traders API** | 🌐 Global | COT data |
| **Commitment of Traders Analysis API** | 🌐 Global | COT analysis |

---

### 27. Fundraisers

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Crowdfunding by CIK API** | 🇺🇸 US Only | Crowdfunding data by CIK |
| **Crowdfunding Search API** | 🇺🇸 US Only | Search crowdfunding |
| **Crowdfunding RSS API** | 🇺🇸 US Only | Real-time crowdfunding feed |
| **Equity Offering by CIK API** | 🇺🇸 US Only | Equity offerings by CIK |
| **Equity Offering Search API** | 🇺🇸 US Only | Search equity offerings |
| **Equity Offering RSS API** | 🇺🇸 US Only | Real-time offering feed |

---

### 28. Bulk Data

**Note:** Bulk endpoints return data as CSV files. Designed for large-scale data analysis.

| Endpoint | Coverage | Description |
|----------|----------|-------------|
| **Income Statement Bulk API** | 🌐 Global | Bulk income statements |
| **Balance Sheet Statement Bulk API** | 🌐 Global | Bulk balance sheets |
| **Cash Flow Statement Bulk API** | 🌐 Global | Bulk cash flow statements |
| **Financial Ratios Bulk API** | 🌐 Global | Bulk financial ratios |
| **Key Metrics Bulk API** | 🌐 Global | Bulk key metrics |
| **Earnings Surprise Bulk API** | 🌐 Global | Bulk earnings surprises |
| **Profile Data Bulk API** | 🌐 Global | Bulk company profiles |
| **Stock Quote Bulk API** | 🌐 Global | Bulk stock quotes |
| **Stock Rating Bulk API** | 🌐 Global | Bulk stock ratings |
| **Stock Price Bulk Data API** | 🌐 Global | Bulk price data |

#### Bulk API Example
```
GET /stable/income-statement-bulk?year=2025&period=Q1
```
| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| year | string | Yes* | 2025 |
| period | string | Yes* | Q1,Q2,Q3,Q4,FY |

---

## Rate Limits by Plan

| Plan | Calls per Minute | Calls per Day |
|------|-----------------|---------------|
| Basic | - | 250 |
| Starter | 300 | Unlimited |
| Premium | 750 | Unlimited |
| Ultimate | 3000 | Unlimited |

---

## Response Formats

- **Standard endpoints:** JSON array/object
- **Bulk endpoints:** CSV file
- **XLSX endpoints:** Excel file

---

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing API key)
- `403` - Forbidden (plan doesn't include this endpoint)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Server Error

---

## Common Use Cases

### 1. Stock Screening
```
GET /stable/company-screener?marketCapMoreThan=1000000000&sector=Technology&isActivelyTrading=true&limit=100
```

### 2. Financial Analysis
```
GET /stable/income-statement?symbol=AAPL&period=annual&limit=5
GET /stable/balance-sheet-statement?symbol=AAPL&period=annual&limit=5
GET /stable/financial-ratios?symbol=AAPL&period=annual&limit=5
```

### 3. Technical Analysis
```
GET /stable/technical-indicators/rsi?symbol=AAPL&periodLength=14&timeframe=1day
GET /stable/technical-indicators/sma?symbol=AAPL&periodLength=50&timeframe=1day
```

### 4. News & Sentiment
```
GET /stable/stock-news?symbol=AAPL&limit=50
GET /stable/stock-news-sentiment?symbol=AAPL
```

### 5. Institutional Holdings
```
GET /stable/institutional-holder?symbol=AAPL
GET /stable/13f?cik=0001067983
```

---

## SDK & Libraries

Official and community SDKs available for:
- Python
- JavaScript/Node.js
- R
- Excel Add-in

---

## Support & Resources

- **Documentation:** https://site.financialmodelingprep.com/developer/docs
- **API Viewer:** Interactive API testing tool
- **Status Page:** API uptime and status

---

*Document generated from FMP API documentation. Last reviewed: January 2025*

