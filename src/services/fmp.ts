import { delay, API_DELAY } from '../utils/delay';
import { logger, apiTracker } from '../utils/logger';
import type {
  CompanyProfile,
  Quote,
  SearchResult,
  KeyMetrics,
  Ratios,
  RatiosTTM,
  AnalystGrade,
  AnalystEstimate,
  HistoricalPrice,
  StockNews,
  SharesFloat,
  Dividend,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  FmpArticle,
  StockNewsItem,
  IndexQuote,
  HistoricalPriceLight,
  ScreenerParams,
  ScreenerResult,
  EarningsReport,
  EarningsCalendarItem,
  InsiderTrade,
  InsiderTradeStats,
  CongressTrade,
  IPOCalendarItem,
  StockSplitCalendarItem,
  DividendCalendarItem,
  MarketMover,
  IndexConstituent,
  EconomicEvent,
  DCFValue,
  StockPeer,
  KeyExecutive,
  EmployeeCount,
  PriceTargetConsensus,
} from '../types/fmp';

const FMP_BASE = 'https://financialmodelingprep.com/stable';
const API_KEY = import.meta.env.VITE_FMP_API_KEY;

// Generic fetch helper with rate limiting and logging
async function fetchFMP<T>(endpoint: string, symbol: string = 'unknown'): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${FMP_BASE}${endpoint}${separator}apikey=${API_KEY}`;

  const callId = apiTracker.startCall(endpoint.split('?')[0], symbol);
  const startTime = performance.now();

  logger.debug('FMP', `Fetching ${endpoint}`, { symbol });

  try {
    const res = await fetch(url);
    const duration = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errorMsg = `FMP API error: ${res.status} ${res.statusText}`;
      logger.error('FMP', errorMsg, { endpoint, symbol, status: res.status });
      apiTracker.endCall(callId, false, undefined, errorMsg);
      throw new Error(errorMsg);
    }

    const data = await res.json();

    // Extract timestamp if available (for data freshness check)
    let dataTimestamp: number | undefined;
    if (Array.isArray(data) && data[0]?.timestamp) {
      dataTimestamp = data[0].timestamp;
    }

    logger.info('FMP', `Fetched ${endpoint}`, {
      symbol,
      recordCount: Array.isArray(data) ? data.length : 1,
      dataTimestamp: dataTimestamp ? new Date(dataTimestamp * 1000).toISOString() : 'N/A'
    }, duration);

    apiTracker.endCall(callId, true, dataTimestamp);

    await delay(API_DELAY); // Rate limit protection
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('FMP', `Failed to fetch ${endpoint}`, { symbol, error: errorMsg });
    apiTracker.endCall(callId, false, undefined, errorMsg);
    throw error;
  }
}

export const fmp = {
  // Company profile - logo, name, description, CEO, etc.
  profile: async (symbol: string): Promise<CompanyProfile[]> => {
    return fetchFMP<CompanyProfile[]>(`/profile?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Real-time quote - price, change, volume, market cap
  quote: async (symbol: string): Promise<Quote[]> => {
    return fetchFMP<Quote[]>(`/quote?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Search for tickers by company name - used for autocomplete
  search: async (query: string, limit = 10): Promise<SearchResult[]> => {
    return fetchFMP<SearchResult[]>(`/search-name?query=${encodeURIComponent(query)}&limit=${limit}`, query);
  },

  // Key metrics - P/E, P/B, EV/EBITDA, etc.
  keyMetrics: async (symbol: string, limit = 1): Promise<KeyMetrics[]> => {
    return fetchFMP<KeyMetrics[]>(`/key-metrics?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Financial ratios
  ratios: async (symbol: string, limit = 1): Promise<Ratios[]> => {
    return fetchFMP<Ratios[]>(`/ratios?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Analyst grades/ratings
  grade: async (symbol: string, limit = 10): Promise<AnalystGrade[]> => {
    return fetchFMP<AnalystGrade[]>(`/grades?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Analyst EPS/revenue estimates
  estimates: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 4): Promise<AnalystEstimate[]> => {
    return fetchFMP<AnalystEstimate[]>(`/analyst-estimates?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`, symbol);
  },

  // Earnings history (actual vs estimated)
  earnings: async (symbol: string, limit = 50): Promise<EarningsReport[]> => {
    return fetchFMP<EarningsReport[]>(`/earnings?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Historical price data for charts (EOD)
  historicalPrice: async (symbol: string, from?: string, to?: string): Promise<HistoricalPrice[]> => {
    let endpoint = `/historical-price-eod/full?symbol=${symbol.toUpperCase()}`;

    if (from) endpoint += `&from=${from}`;
    if (to) endpoint += `&to=${to}`;

    return fetchFMP<HistoricalPrice[]>(endpoint, symbol);
  },

  // Company news
  news: async (symbol: string, limit = 10): Promise<StockNews[]> => {
    return fetchFMP<StockNews[]>(`/news?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Shares float data
  sharesFloat: async (symbol: string): Promise<SharesFloat[]> => {
    return fetchFMP<SharesFloat[]>(`/shares-float?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Dividend history
  dividends: async (symbol: string, limit = 5): Promise<Dividend[]> => {
    return fetchFMP<Dividend[]>(`/dividends?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // TTM ratios (trailing twelve months)
  ratiosTTM: async (symbol: string): Promise<RatiosTTM[]> => {
    return fetchFMP<RatiosTTM[]>(`/ratios-ttm?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Income statement
  incomeStatement: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 10): Promise<IncomeStatement[]> => {
    return fetchFMP<IncomeStatement[]>(`/income-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`, symbol);
  },

  // Balance sheet
  balanceSheet: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 10): Promise<BalanceSheet[]> => {
    return fetchFMP<BalanceSheet[]>(`/balance-sheet-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`, symbol);
  },

  // Cash flow statement
  cashFlow: async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 10): Promise<CashFlowStatement[]> => {
    return fetchFMP<CashFlowStatement[]>(`/cash-flow-statement?symbol=${symbol.toUpperCase()}&period=${period}&limit=${limit}`, symbol);
  },

  // FMP Articles/News (general market news)
  articles: async (limit = 50): Promise<FmpArticle[]> => {
    return fetchFMP<FmpArticle[]>(`/fmp-articles?limit=${limit}`, 'articles');
  },

  // Stock News (latest from all stocks)
  stockNewsLatest: async (page = 0, limit = 100): Promise<StockNewsItem[]> => {
    return fetchFMP<StockNewsItem[]>(`/news/stock-latest?page=${page}&limit=${limit}`, 'stock-news');
  },

  // Stock News (filtered by symbol)
  stockNews: async (symbols: string, page = 0, limit = 50): Promise<StockNewsItem[]> => {
    return fetchFMP<StockNewsItem[]>(`/news/stock?symbols=${symbols.toUpperCase()}&page=${page}&limit=${limit}`, symbols);
  },

  // General News (market-wide, no specific symbol)
  generalNews: async (page = 0, limit = 50): Promise<StockNewsItem[]> => {
    return fetchFMP<StockNewsItem[]>(`/news/general-latest?page=${page}&limit=${limit}`, 'general-news');
  },

  // Index Quote
  indexQuote: async (symbol: string): Promise<IndexQuote[]> => {
    return fetchFMP<IndexQuote[]>(`/quote?symbol=${encodeURIComponent(symbol)}`, symbol);
  },

  // Historical Price Light (for calculating period changes)
  historicalPriceLight: async (symbol: string, from?: string, to?: string): Promise<HistoricalPriceLight[]> => {
    let endpoint = `/historical-price-eod/light?symbol=${encodeURIComponent(symbol)}`;
    if (from) endpoint += `&from=${from}`;
    if (to) endpoint += `&to=${to}`;
    return fetchFMP<HistoricalPriceLight[]>(endpoint, symbol);
  },

  // Commodity Quote
  commodityQuote: async (symbol: string): Promise<Quote[]> => {
    return fetchFMP<Quote[]>(`/quote?symbol=${encodeURIComponent(symbol)}`, symbol);
  },

  // ===== EQUITY SCREENER ENDPOINTS =====

  // Company Screener (server-side filtering)
  companyScreener: async (params: ScreenerParams): Promise<ScreenerResult[]> => {
    const queryParts: string[] = [];

    if (params.sector) queryParts.push(`sector=${encodeURIComponent(params.sector)}`);
    if (params.industry) queryParts.push(`industry=${encodeURIComponent(params.industry)}`);
    if (params.country) queryParts.push(`country=${encodeURIComponent(params.country)}`);
    if (params.exchange) queryParts.push(`exchange=${encodeURIComponent(params.exchange)}`);
    if (params.marketCapMoreThan !== undefined) queryParts.push(`marketCapMoreThan=${params.marketCapMoreThan}`);
    if (params.marketCapLowerThan !== undefined) queryParts.push(`marketCapLowerThan=${params.marketCapLowerThan}`);
    if (params.priceMoreThan !== undefined) queryParts.push(`priceMoreThan=${params.priceMoreThan}`);
    if (params.priceLowerThan !== undefined) queryParts.push(`priceLowerThan=${params.priceLowerThan}`);
    if (params.volumeMoreThan !== undefined) queryParts.push(`volumeMoreThan=${params.volumeMoreThan}`);
    if (params.volumeLowerThan !== undefined) queryParts.push(`volumeLowerThan=${params.volumeLowerThan}`);
    if (params.betaMoreThan !== undefined) queryParts.push(`betaMoreThan=${params.betaMoreThan}`);
    if (params.betaLowerThan !== undefined) queryParts.push(`betaLowerThan=${params.betaLowerThan}`);
    if (params.dividendMoreThan !== undefined) queryParts.push(`dividendMoreThan=${params.dividendMoreThan}`);
    if (params.dividendLowerThan !== undefined) queryParts.push(`dividendLowerThan=${params.dividendLowerThan}`);
    if (params.isEtf !== undefined) queryParts.push(`isEtf=${params.isEtf}`);
    if (params.isFund !== undefined) queryParts.push(`isFund=${params.isFund}`);
    if (params.isActivelyTrading !== undefined) queryParts.push(`isActivelyTrading=${params.isActivelyTrading}`);
    queryParts.push(`limit=${params.limit || 500}`);

    const endpoint = `/company-screener?${queryParts.join('&')}`;
    return fetchFMP<ScreenerResult[]>(endpoint, 'screener');
  },

  // Batch Quote - returns simplified data (no P/E, EPS)
  // The /batch-quote endpoint is efficient but doesn't include valuation metrics
  batchQuote: async (symbols: string[]): Promise<Quote[]> => {
    if (symbols.length === 0) return [];
    const symbolList = symbols.slice(0, 50).join(',');
    return fetchFMP<Quote[]>(`/batch-quote?symbols=${symbolList}`, 'batch-quote');
  },

  // Single quote - returns full data including P/E, EPS
  // More expensive (1 call per symbol) but includes all fields
  singleQuote: async (symbol: string): Promise<Quote | null> => {
    const quotes = await fetchFMP<Quote[]>(`/quote?symbol=${symbol.toUpperCase()}`, symbol);
    return quotes.length > 0 ? quotes[0] : null;
  },

  // Key Metrics TTM (for enriched screener data)
  keyMetricsTTM: async (symbol: string): Promise<KeyMetrics[]> => {
    return fetchFMP<KeyMetrics[]>(`/key-metrics-ttm?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // ===== EARNINGS CALENDAR ENDPOINTS =====

  // Earnings calendar (upcoming/recent earnings dates)
  earningsCalendar: async (from?: string, to?: string): Promise<EarningsCalendarItem[]> => {
    let endpoint = '/earnings-calendar';
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return fetchFMP<EarningsCalendarItem[]>(endpoint, 'earnings-calendar');
  },

  // ===== INSIDER TRADING ENDPOINTS =====

  // Insider trades for a specific symbol
  insiderTrades: async (symbol: string, limit = 100): Promise<InsiderTrade[]> => {
    return fetchFMP<InsiderTrade[]>(`/insider-trading/search?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // Latest insider trades (all symbols)
  insiderTradesLatest: async (limit = 100): Promise<InsiderTrade[]> => {
    return fetchFMP<InsiderTrade[]>(`/insider-trading/latest?limit=${limit}`, 'insider-latest');
  },

  // Insider trade statistics by symbol
  insiderTradeStats: async (symbol: string): Promise<InsiderTradeStats[]> => {
    return fetchFMP<InsiderTradeStats[]>(`/insider-trading/statistics?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // ===== CONGRESSIONAL TRADING ENDPOINTS =====

  // House trades for a specific symbol
  houseTrades: async (symbol: string, limit = 100): Promise<CongressTrade[]> => {
    return fetchFMP<CongressTrade[]>(`/house-trades?symbol=${symbol.toUpperCase()}&limit=${limit}`, symbol);
  },

  // ===== CALENDAR ENDPOINTS =====

  // IPO Calendar (upcoming and recent IPOs)
  ipoCalendar: async (from?: string, to?: string): Promise<IPOCalendarItem[]> => {
    let endpoint = '/ipos-calendar';
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return fetchFMP<IPOCalendarItem[]>(endpoint, 'ipo-calendar');
  },

  // Stock Split Calendar (upcoming and recent splits)
  splitCalendar: async (from?: string, to?: string): Promise<StockSplitCalendarItem[]> => {
    let endpoint = '/splits-calendar';
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return fetchFMP<StockSplitCalendarItem[]>(endpoint, 'split-calendar');
  },

  // Dividend Calendar (upcoming ex-dividend dates)
  dividendCalendar: async (from?: string, to?: string): Promise<DividendCalendarItem[]> => {
    let endpoint = '/dividends-calendar';
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return fetchFMP<DividendCalendarItem[]>(endpoint, 'dividend-calendar');
  },

  // ===== MARKET MOVERS ENDPOINTS =====

  // Biggest gainers
  biggestGainers: async (): Promise<MarketMover[]> => {
    return fetchFMP<MarketMover[]>('/biggest-gainers', 'gainers');
  },

  // Biggest losers
  biggestLosers: async (): Promise<MarketMover[]> => {
    return fetchFMP<MarketMover[]>('/biggest-losers', 'losers');
  },

  // Most active (by volume)
  mostActive: async (): Promise<MarketMover[]> => {
    return fetchFMP<MarketMover[]>('/most-active', 'most-active');
  },

  // ===== INDEX CONSTITUENTS ENDPOINTS =====

  // S&P 500 constituents
  sp500Constituents: async (): Promise<IndexConstituent[]> => {
    return fetchFMP<IndexConstituent[]>('/sp500-constituent', 'sp500');
  },

  // Nasdaq 100 constituents
  nasdaqConstituents: async (): Promise<IndexConstituent[]> => {
    return fetchFMP<IndexConstituent[]>('/nasdaq-constituent', 'nasdaq');
  },

  // Dow Jones 30 constituents
  dowjonesConstituents: async (): Promise<IndexConstituent[]> => {
    return fetchFMP<IndexConstituent[]>('/dowjones-constituent', 'dowjones');
  },

  // ===== ECONOMIC CALENDAR ENDPOINTS =====

  // Economic calendar (upcoming/recent economic events)
  economicCalendar: async (from?: string, to?: string): Promise<EconomicEvent[]> => {
    let endpoint = '/economic-calendar';
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return fetchFMP<EconomicEvent[]>(endpoint, 'economic-calendar');
  },

  // ===== COMPANY ANALYSIS ENDPOINTS =====

  // DCF (Discounted Cash Flow) - Fair value calculation
  dcf: async (symbol: string): Promise<DCFValue[]> => {
    return fetchFMP<DCFValue[]>(`/discounted-cash-flow?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Stock Peers - Similar companies
  stockPeers: async (symbol: string): Promise<StockPeer[]> => {
    return fetchFMP<StockPeer[]>(`/stock-peers?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Key Executives - Leadership info
  keyExecutives: async (symbol: string): Promise<KeyExecutive[]> => {
    return fetchFMP<KeyExecutive[]>(`/key-executives?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Employee Count - Historical employee numbers
  employeeCount: async (symbol: string): Promise<EmployeeCount[]> => {
    return fetchFMP<EmployeeCount[]>(`/employee-count?symbol=${symbol.toUpperCase()}`, symbol);
  },

  // Price Target Consensus - Analyst price targets
  priceTargetConsensus: async (symbol: string): Promise<PriceTargetConsensus[]> => {
    return fetchFMP<PriceTargetConsensus[]>(`/price-target-consensus?symbol=${symbol.toUpperCase()}`, symbol);
  },
};

export default fmp;
