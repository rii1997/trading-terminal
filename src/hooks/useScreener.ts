import { useState, useCallback, useRef } from 'react';
import { fmp } from '../services/fmp';
import type { ScreenerParams, ScreenerResult, EnrichedStock, Quote } from '../types/fmp';

// Client-side filter options
export interface ClientFilters {
  // Quote-based filters
  peMin?: number;
  peMax?: number;
  epsMin?: number;
  epsMax?: number;
  priceVsSma50?: 'above' | 'below';
  priceVsSma200?: 'above' | 'below';
  sma50Percent?: number; // % above/below SMA50
  sma200Percent?: number; // % above/below SMA200
  nearYearHighPct?: number; // Within X% of year high
  nearYearLowPct?: number; // Within X% of year low
  dayChangePctMin?: number;
  dayChangePctMax?: number;
  avgVolumeMin?: number;
  avgVolumeMax?: number;

  // Valuation Ratios
  priceToBookMin?: number;
  priceToBookMax?: number;
  priceToSalesMin?: number;
  priceToSalesMax?: number;
  priceToFcfMin?: number;
  priceToFcfMax?: number;
  pegMin?: number;
  pegMax?: number;
  evEbitdaMin?: number;
  evEbitdaMax?: number;
  dividendYieldMin?: number;
  dividendYieldMax?: number;

  // Profitability Ratios
  grossMarginMin?: number;
  grossMarginMax?: number;
  operatingMarginMin?: number;
  operatingMarginMax?: number;
  netMarginMin?: number;
  netMarginMax?: number;
  roaMin?: number;
  roaMax?: number;
  roeMin?: number;
  roeMax?: number;
  roceMin?: number;
  roceMax?: number;

  // Liquidity Ratios
  currentRatioMin?: number;
  currentRatioMax?: number;
  quickRatioMin?: number;
  quickRatioMax?: number;
  cashRatioMin?: number;
  cashRatioMax?: number;

  // Debt/Leverage Ratios
  debtRatioMin?: number;
  debtRatioMax?: number;
  debtEquityMin?: number;
  debtEquityMax?: number;
  interestCoverageMin?: number;
  interestCoverageMax?: number;

  // Efficiency Ratios
  assetTurnoverMin?: number;
  assetTurnoverMax?: number;
  inventoryTurnoverMin?: number;
  inventoryTurnoverMax?: number;

  // Per Share
  fcfPerShareMin?: number;
  fcfPerShareMax?: number;
  payoutRatioMin?: number;
  payoutRatioMax?: number;
}

export type SortField =
  | 'symbol'
  | 'companyName'
  | 'price'
  | 'changesPercentage'
  | 'marketCap'
  | 'pe'
  | 'volume'
  | 'sector'
  | 'industry';

export type SortDirection = 'asc' | 'desc';

interface UseScreenerResult {
  // Data
  results: EnrichedStock[];
  totalResults: number;
  paginatedResults: EnrichedStock[];

  // Loading states
  loading: boolean;
  enriching: boolean;
  error: Error | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;

  // Sorting
  sortField: SortField;
  sortDirection: SortDirection;
  setSort: (field: SortField) => void;

  // Actions
  runScreen: (serverParams: ScreenerParams, clientFilters: ClientFilters) => Promise<void>;
  reset: () => void;
}

const PAGE_SIZE = 50;
const BATCH_SIZE = 50;

export function useScreener(): UseScreenerResult {
  const [results, setResults] = useState<EnrichedStock[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Track current operation to handle cancellation
  const operationRef = useRef(0);

  // Enrich screener results with quote data
  // The batch-quote endpoint returns simplified data (no P/E, EPS)
  // When fundamental filters are active, we fetch individual quotes for those metrics
  const enrichWithQuotes = useCallback(async (
    stocks: ScreenerResult[],
    operationId: number,
    needsFundamentalData: boolean
  ): Promise<EnrichedStock[]> => {
    const enrichedStocks: EnrichedStock[] = stocks.map(s => ({ ...s }));
    const symbols = stocks.map(s => s.symbol);

    // Step 1: Fetch batch quotes for basic data (price, change, volume, SMAs)
    console.log('[Screener] Fetching batch quotes for basic data...');
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      if (operationRef.current !== operationId) return enrichedStocks;

      const batchSymbols = symbols.slice(i, i + BATCH_SIZE);
      try {
        const quotes = await fmp.batchQuote(batchSymbols);
        console.log(`[Screener] Batch ${i/BATCH_SIZE}: got ${quotes.length} quotes for ${batchSymbols.length} symbols`);

        // Debug: log first quote to see ALL fields
        if (quotes.length > 0 && i === 0) {
          console.log('[Screener] Batch-quote fields:', Object.keys(quotes[0]));
        }

        const quoteMap = new Map<string, Quote>();
        quotes.forEach(q => quoteMap.set(q.symbol, q));

        // Merge quote data into enriched stocks
        for (let j = i; j < Math.min(i + BATCH_SIZE, enrichedStocks.length); j++) {
          const stock = enrichedStocks[j];
          const quote = quoteMap.get(stock.symbol);
          if (quote) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quoteAny = quote as any;
            stock.price = quote.price ?? stock.price;
            stock.change = quote.change;
            // Handle both changePercentage and changesPercentage (API inconsistency)
            stock.changesPercentage = quoteAny.changesPercentage ?? quoteAny.changePercentage;
            stock.priceAvg50 = quote.priceAvg50;
            stock.priceAvg200 = quote.priceAvg200;
            stock.yearHigh = quote.yearHigh;
            stock.yearLow = quote.yearLow;
            stock.avgVolume = quote.avgVolume;
            stock.dayHigh = quote.dayHigh;
            stock.dayLow = quote.dayLow;
            stock.open = quote.open;
            stock.previousClose = quote.previousClose;
            stock.volume = quote.volume ?? stock.volume;
            // Note: P/E and EPS are NOT available from batch-quote
            // They will be fetched separately if needed

            // Calculate derived fields
            if (quote.priceAvg50 && quote.priceAvg50 > 0) {
              stock.priceVsSma50 = (stock.price ?? 0) / quote.priceAvg50;
            }
            if (quote.priceAvg200 && quote.priceAvg200 > 0) {
              stock.priceVsSma200 = (stock.price ?? 0) / quote.priceAvg200;
            }
            if (quote.yearHigh && quote.yearHigh > 0) {
              stock.nearYearHigh = (stock.price ?? 0) / quote.yearHigh;
            }
            if (quote.yearLow && quote.yearLow > 0) {
              stock.nearYearLow = (stock.price ?? 0) / quote.yearLow;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching batch quotes:', err);
      }
    }

    // Step 2: If fundamental data is needed, fetch from /ratios endpoint
    // This endpoint provides P/E, P/B, margins, ROE, and all other financial ratios
    // Limited to first 100 symbols to avoid excessive API calls
    if (needsFundamentalData) {
      const FUNDAMENTAL_LIMIT = 100;
      const symbolsToEnrich = symbols.slice(0, FUNDAMENTAL_LIMIT);
      console.log(`[Screener] Fetching ratios for fundamental data (${symbolsToEnrich.length} symbols)...`);

      let enrichedCount = 0;
      for (let i = 0; i < symbolsToEnrich.length; i++) {
        if (operationRef.current !== operationId) return enrichedStocks;

        try {
          const ratios = await fmp.ratios(symbolsToEnrich[i], 1);
          if (ratios && ratios.length > 0) {
            const ratio = ratios[0];
            const stock = enrichedStocks[i];

            // Valuation Ratios
            stock.pe = ratio.priceToEarningsRatio;
            stock.priceToBookRatio = ratio.priceToBookRatio;
            stock.priceToSalesRatio = ratio.priceToSalesRatio;
            stock.priceToFreeCashFlowsRatio = ratio.priceToFreeCashFlowsRatio;
            stock.priceEarningsToGrowthRatio = ratio.priceEarningsToGrowthRatio;
            stock.enterpriseValueMultiple = ratio.enterpriseValueMultiple;
            stock.dividendYield = ratio.dividendYield;
            stock.priceFairValue = ratio.priceFairValue;

            // EPS calculated from price / PE
            if (stock.price && ratio.priceToEarningsRatio && ratio.priceToEarningsRatio > 0) {
              stock.eps = stock.price / ratio.priceToEarningsRatio;
            }

            // Profitability Ratios (convert to percentage)
            stock.grossProfitMargin = ratio.grossProfitMargin ? ratio.grossProfitMargin * 100 : undefined;
            stock.operatingProfitMargin = ratio.operatingProfitMargin ? ratio.operatingProfitMargin * 100 : undefined;
            stock.netProfitMargin = ratio.netProfitMargin ? ratio.netProfitMargin * 100 : undefined;
            stock.returnOnAssets = ratio.returnOnAssets ? ratio.returnOnAssets * 100 : undefined;
            stock.returnOnEquity = ratio.returnOnEquity ? ratio.returnOnEquity * 100 : undefined;
            stock.returnOnCapitalEmployed = ratio.returnOnCapitalEmployed ? ratio.returnOnCapitalEmployed * 100 : undefined;

            // Liquidity Ratios
            stock.currentRatio = ratio.currentRatio;
            stock.quickRatio = ratio.quickRatio;
            stock.cashRatio = ratio.cashRatio;

            // Debt/Leverage Ratios
            stock.debtRatio = ratio.debtRatio;
            stock.debtEquityRatio = ratio.debtEquityRatio;
            stock.interestCoverage = ratio.interestCoverage;
            stock.cashFlowToDebtRatio = ratio.cashFlowToDebtRatio;

            // Efficiency Ratios
            stock.assetTurnover = ratio.assetTurnover;
            stock.inventoryTurnover = ratio.inventoryTurnover;
            stock.receivablesTurnover = ratio.receivablesTurnover;
            stock.daysOfSalesOutstanding = ratio.daysOfSalesOutstanding;
            stock.cashConversionCycle = ratio.cashConversionCycle;

            // Per Share Data
            stock.freeCashFlowPerShare = ratio.freeCashFlowPerShare;
            stock.cashPerShare = ratio.cashPerShare;
            stock.payoutRatio = ratio.payoutRatio ? ratio.payoutRatio * 100 : undefined;

            if (stock.pe !== undefined && stock.pe !== null && stock.pe > 0) {
              enrichedCount++;
            }
          }
        } catch (err) {
          // Silently continue on individual failures
        }
      }
      console.log(`[Screener] Enriched ${enrichedCount}/${symbolsToEnrich.length} stocks with fundamental data`);
    }

    return enrichedStocks;
  }, []);

  // Apply client-side filters
  const applyClientFilters = useCallback((
    stocks: EnrichedStock[],
    filters: ClientFilters
  ): EnrichedStock[] => {
    console.log('[Screener] Applying client filters:', filters);
    console.log('[Screener] Stocks with P/E data:', stocks.filter(s => s.pe && s.pe > 0).length);

    return stocks.filter(stock => {
      // P/E filter - only filter stocks that have P/E data
      if (filters.peMin !== undefined || filters.peMax !== undefined) {
        // Skip stocks without P/E data when P/E filter is active
        if (stock.pe === undefined || stock.pe === null || stock.pe <= 0) {
          return false;
        }
        if (filters.peMin !== undefined && stock.pe < filters.peMin) {
          return false;
        }
        if (filters.peMax !== undefined && stock.pe > filters.peMax) {
          return false;
        }
      }

      // EPS filter - only filter stocks that have EPS data
      if (filters.epsMin !== undefined || filters.epsMax !== undefined) {
        if (stock.eps === undefined || stock.eps === null) {
          return false;
        }
        if (filters.epsMin !== undefined && stock.eps < filters.epsMin) {
          return false;
        }
        if (filters.epsMax !== undefined && stock.eps > filters.epsMax) {
          return false;
        }
      }

      // SMA50 filter
      if (filters.priceVsSma50 && stock.priceVsSma50 !== undefined) {
        const threshold = 1 + (filters.sma50Percent || 0) / 100;
        if (filters.priceVsSma50 === 'above' && stock.priceVsSma50 < threshold) {
          return false;
        }
        if (filters.priceVsSma50 === 'below' && stock.priceVsSma50 > (1 / threshold)) {
          return false;
        }
      }

      // SMA200 filter
      if (filters.priceVsSma200 && stock.priceVsSma200 !== undefined) {
        const threshold = 1 + (filters.sma200Percent || 0) / 100;
        if (filters.priceVsSma200 === 'above' && stock.priceVsSma200 < threshold) {
          return false;
        }
        if (filters.priceVsSma200 === 'below' && stock.priceVsSma200 > (1 / threshold)) {
          return false;
        }
      }

      // Near 52-week high filter
      if (filters.nearYearHighPct !== undefined && stock.nearYearHigh !== undefined) {
        const threshold = 1 - filters.nearYearHighPct / 100;
        if (stock.nearYearHigh < threshold) {
          return false;
        }
      }

      // Near 52-week low filter
      if (filters.nearYearLowPct !== undefined && stock.nearYearLow !== undefined) {
        const threshold = 1 + filters.nearYearLowPct / 100;
        if (stock.nearYearLow > threshold) {
          return false;
        }
      }

      // Day change % filter
      if (filters.dayChangePctMin !== undefined && (stock.changesPercentage === undefined || stock.changesPercentage < filters.dayChangePctMin)) {
        return false;
      }
      if (filters.dayChangePctMax !== undefined && (stock.changesPercentage === undefined || stock.changesPercentage > filters.dayChangePctMax)) {
        return false;
      }

      // Avg Volume filter
      if (filters.avgVolumeMin !== undefined && (stock.avgVolume === undefined || stock.avgVolume < filters.avgVolumeMin)) {
        return false;
      }
      if (filters.avgVolumeMax !== undefined && (stock.avgVolume === undefined || stock.avgVolume > filters.avgVolumeMax)) {
        return false;
      }

      // ===== Valuation Ratios =====

      // P/B filter
      if (filters.priceToBookMin !== undefined || filters.priceToBookMax !== undefined) {
        if (stock.priceToBookRatio === undefined || stock.priceToBookRatio === null) return false;
        if (filters.priceToBookMin !== undefined && stock.priceToBookRatio < filters.priceToBookMin) return false;
        if (filters.priceToBookMax !== undefined && stock.priceToBookRatio > filters.priceToBookMax) return false;
      }

      // P/S filter
      if (filters.priceToSalesMin !== undefined || filters.priceToSalesMax !== undefined) {
        if (stock.priceToSalesRatio === undefined || stock.priceToSalesRatio === null) return false;
        if (filters.priceToSalesMin !== undefined && stock.priceToSalesRatio < filters.priceToSalesMin) return false;
        if (filters.priceToSalesMax !== undefined && stock.priceToSalesRatio > filters.priceToSalesMax) return false;
      }

      // P/FCF filter
      if (filters.priceToFcfMin !== undefined || filters.priceToFcfMax !== undefined) {
        if (stock.priceToFreeCashFlowsRatio === undefined || stock.priceToFreeCashFlowsRatio === null) return false;
        if (filters.priceToFcfMin !== undefined && stock.priceToFreeCashFlowsRatio < filters.priceToFcfMin) return false;
        if (filters.priceToFcfMax !== undefined && stock.priceToFreeCashFlowsRatio > filters.priceToFcfMax) return false;
      }

      // PEG filter
      if (filters.pegMin !== undefined || filters.pegMax !== undefined) {
        if (stock.priceEarningsToGrowthRatio === undefined || stock.priceEarningsToGrowthRatio === null) return false;
        if (filters.pegMin !== undefined && stock.priceEarningsToGrowthRatio < filters.pegMin) return false;
        if (filters.pegMax !== undefined && stock.priceEarningsToGrowthRatio > filters.pegMax) return false;
      }

      // EV/EBITDA filter
      if (filters.evEbitdaMin !== undefined || filters.evEbitdaMax !== undefined) {
        if (stock.enterpriseValueMultiple === undefined || stock.enterpriseValueMultiple === null) return false;
        if (filters.evEbitdaMin !== undefined && stock.enterpriseValueMultiple < filters.evEbitdaMin) return false;
        if (filters.evEbitdaMax !== undefined && stock.enterpriseValueMultiple > filters.evEbitdaMax) return false;
      }

      // Dividend Yield filter
      if (filters.dividendYieldMin !== undefined || filters.dividendYieldMax !== undefined) {
        if (stock.dividendYield === undefined || stock.dividendYield === null) return false;
        if (filters.dividendYieldMin !== undefined && stock.dividendYield < filters.dividendYieldMin) return false;
        if (filters.dividendYieldMax !== undefined && stock.dividendYield > filters.dividendYieldMax) return false;
      }

      // ===== Profitability Ratios =====

      // Gross Margin filter
      if (filters.grossMarginMin !== undefined || filters.grossMarginMax !== undefined) {
        if (stock.grossProfitMargin === undefined || stock.grossProfitMargin === null) return false;
        if (filters.grossMarginMin !== undefined && stock.grossProfitMargin < filters.grossMarginMin) return false;
        if (filters.grossMarginMax !== undefined && stock.grossProfitMargin > filters.grossMarginMax) return false;
      }

      // Operating Margin filter
      if (filters.operatingMarginMin !== undefined || filters.operatingMarginMax !== undefined) {
        if (stock.operatingProfitMargin === undefined || stock.operatingProfitMargin === null) return false;
        if (filters.operatingMarginMin !== undefined && stock.operatingProfitMargin < filters.operatingMarginMin) return false;
        if (filters.operatingMarginMax !== undefined && stock.operatingProfitMargin > filters.operatingMarginMax) return false;
      }

      // Net Margin filter
      if (filters.netMarginMin !== undefined || filters.netMarginMax !== undefined) {
        if (stock.netProfitMargin === undefined || stock.netProfitMargin === null) return false;
        if (filters.netMarginMin !== undefined && stock.netProfitMargin < filters.netMarginMin) return false;
        if (filters.netMarginMax !== undefined && stock.netProfitMargin > filters.netMarginMax) return false;
      }

      // ROA filter
      if (filters.roaMin !== undefined || filters.roaMax !== undefined) {
        if (stock.returnOnAssets === undefined || stock.returnOnAssets === null) return false;
        if (filters.roaMin !== undefined && stock.returnOnAssets < filters.roaMin) return false;
        if (filters.roaMax !== undefined && stock.returnOnAssets > filters.roaMax) return false;
      }

      // ROE filter
      if (filters.roeMin !== undefined || filters.roeMax !== undefined) {
        if (stock.returnOnEquity === undefined || stock.returnOnEquity === null) return false;
        if (filters.roeMin !== undefined && stock.returnOnEquity < filters.roeMin) return false;
        if (filters.roeMax !== undefined && stock.returnOnEquity > filters.roeMax) return false;
      }

      // ROCE filter
      if (filters.roceMin !== undefined || filters.roceMax !== undefined) {
        if (stock.returnOnCapitalEmployed === undefined || stock.returnOnCapitalEmployed === null) return false;
        if (filters.roceMin !== undefined && stock.returnOnCapitalEmployed < filters.roceMin) return false;
        if (filters.roceMax !== undefined && stock.returnOnCapitalEmployed > filters.roceMax) return false;
      }

      // ===== Liquidity Ratios =====

      // Current Ratio filter
      if (filters.currentRatioMin !== undefined || filters.currentRatioMax !== undefined) {
        if (stock.currentRatio === undefined || stock.currentRatio === null) return false;
        if (filters.currentRatioMin !== undefined && stock.currentRatio < filters.currentRatioMin) return false;
        if (filters.currentRatioMax !== undefined && stock.currentRatio > filters.currentRatioMax) return false;
      }

      // Quick Ratio filter
      if (filters.quickRatioMin !== undefined || filters.quickRatioMax !== undefined) {
        if (stock.quickRatio === undefined || stock.quickRatio === null) return false;
        if (filters.quickRatioMin !== undefined && stock.quickRatio < filters.quickRatioMin) return false;
        if (filters.quickRatioMax !== undefined && stock.quickRatio > filters.quickRatioMax) return false;
      }

      // Cash Ratio filter
      if (filters.cashRatioMin !== undefined || filters.cashRatioMax !== undefined) {
        if (stock.cashRatio === undefined || stock.cashRatio === null) return false;
        if (filters.cashRatioMin !== undefined && stock.cashRatio < filters.cashRatioMin) return false;
        if (filters.cashRatioMax !== undefined && stock.cashRatio > filters.cashRatioMax) return false;
      }

      // ===== Debt/Leverage Ratios =====

      // Debt Ratio filter
      if (filters.debtRatioMin !== undefined || filters.debtRatioMax !== undefined) {
        if (stock.debtRatio === undefined || stock.debtRatio === null) return false;
        if (filters.debtRatioMin !== undefined && stock.debtRatio < filters.debtRatioMin) return false;
        if (filters.debtRatioMax !== undefined && stock.debtRatio > filters.debtRatioMax) return false;
      }

      // Debt/Equity filter
      if (filters.debtEquityMin !== undefined || filters.debtEquityMax !== undefined) {
        if (stock.debtEquityRatio === undefined || stock.debtEquityRatio === null) return false;
        if (filters.debtEquityMin !== undefined && stock.debtEquityRatio < filters.debtEquityMin) return false;
        if (filters.debtEquityMax !== undefined && stock.debtEquityRatio > filters.debtEquityMax) return false;
      }

      // Interest Coverage filter
      if (filters.interestCoverageMin !== undefined || filters.interestCoverageMax !== undefined) {
        if (stock.interestCoverage === undefined || stock.interestCoverage === null) return false;
        if (filters.interestCoverageMin !== undefined && stock.interestCoverage < filters.interestCoverageMin) return false;
        if (filters.interestCoverageMax !== undefined && stock.interestCoverage > filters.interestCoverageMax) return false;
      }

      // ===== Efficiency Ratios =====

      // Asset Turnover filter
      if (filters.assetTurnoverMin !== undefined || filters.assetTurnoverMax !== undefined) {
        if (stock.assetTurnover === undefined || stock.assetTurnover === null) return false;
        if (filters.assetTurnoverMin !== undefined && stock.assetTurnover < filters.assetTurnoverMin) return false;
        if (filters.assetTurnoverMax !== undefined && stock.assetTurnover > filters.assetTurnoverMax) return false;
      }

      // Inventory Turnover filter
      if (filters.inventoryTurnoverMin !== undefined || filters.inventoryTurnoverMax !== undefined) {
        if (stock.inventoryTurnover === undefined || stock.inventoryTurnover === null) return false;
        if (filters.inventoryTurnoverMin !== undefined && stock.inventoryTurnover < filters.inventoryTurnoverMin) return false;
        if (filters.inventoryTurnoverMax !== undefined && stock.inventoryTurnover > filters.inventoryTurnoverMax) return false;
      }

      // ===== Per Share =====

      // FCF Per Share filter
      if (filters.fcfPerShareMin !== undefined || filters.fcfPerShareMax !== undefined) {
        if (stock.freeCashFlowPerShare === undefined || stock.freeCashFlowPerShare === null) return false;
        if (filters.fcfPerShareMin !== undefined && stock.freeCashFlowPerShare < filters.fcfPerShareMin) return false;
        if (filters.fcfPerShareMax !== undefined && stock.freeCashFlowPerShare > filters.fcfPerShareMax) return false;
      }

      // Payout Ratio filter
      if (filters.payoutRatioMin !== undefined || filters.payoutRatioMax !== undefined) {
        if (stock.payoutRatio === undefined || stock.payoutRatio === null) return false;
        if (filters.payoutRatioMin !== undefined && stock.payoutRatio < filters.payoutRatioMin) return false;
        if (filters.payoutRatioMax !== undefined && stock.payoutRatio > filters.payoutRatioMax) return false;
      }

      return true;
    });
  }, []);

  // Sort results
  const sortResults = useCallback((
    stocks: EnrichedStock[],
    field: SortField,
    direction: SortDirection
  ): EnrichedStock[] => {
    const sorted = [...stocks].sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      switch (field) {
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case 'companyName':
          aVal = a.companyName;
          bVal = b.companyName;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'changesPercentage':
          aVal = a.changesPercentage ?? 0;
          bVal = b.changesPercentage ?? 0;
          break;
        case 'marketCap':
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        case 'pe':
          aVal = a.pe ?? Infinity;
          bVal = b.pe ?? Infinity;
          break;
        case 'volume':
          aVal = a.volume;
          bVal = b.volume;
          break;
        case 'sector':
          aVal = a.sector;
          bVal = b.sector;
          break;
        case 'industry':
          aVal = a.industry;
          bVal = b.industry;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, []);

  // Run the screen
  const runScreen = useCallback(async (
    serverParams: ScreenerParams,
    clientFilters: ClientFilters
  ) => {
    const operationId = ++operationRef.current;

    setLoading(true);
    setEnriching(false);
    setError(null);
    setCurrentPage(1);

    try {
      // Step 1: Server-side filtering
      const screenerResults = await fmp.companyScreener({
        ...serverParams,
        isActivelyTrading: serverParams.isActivelyTrading ?? true,
        limit: serverParams.limit || 500,
      });

      if (operationRef.current !== operationId) return;

      // Step 2: Enrich with quote data
      setLoading(false);
      setEnriching(true);

      // Determine if we need fundamental data - requires individual API calls to /ratios endpoint
      const needsFundamentalData = (
        // Valuation
        clientFilters.peMin !== undefined || clientFilters.peMax !== undefined ||
        clientFilters.epsMin !== undefined || clientFilters.epsMax !== undefined ||
        clientFilters.priceToBookMin !== undefined || clientFilters.priceToBookMax !== undefined ||
        clientFilters.priceToSalesMin !== undefined || clientFilters.priceToSalesMax !== undefined ||
        clientFilters.priceToFcfMin !== undefined || clientFilters.priceToFcfMax !== undefined ||
        clientFilters.pegMin !== undefined || clientFilters.pegMax !== undefined ||
        clientFilters.evEbitdaMin !== undefined || clientFilters.evEbitdaMax !== undefined ||
        clientFilters.dividendYieldMin !== undefined || clientFilters.dividendYieldMax !== undefined ||
        // Profitability
        clientFilters.grossMarginMin !== undefined || clientFilters.grossMarginMax !== undefined ||
        clientFilters.operatingMarginMin !== undefined || clientFilters.operatingMarginMax !== undefined ||
        clientFilters.netMarginMin !== undefined || clientFilters.netMarginMax !== undefined ||
        clientFilters.roaMin !== undefined || clientFilters.roaMax !== undefined ||
        clientFilters.roeMin !== undefined || clientFilters.roeMax !== undefined ||
        clientFilters.roceMin !== undefined || clientFilters.roceMax !== undefined ||
        // Liquidity
        clientFilters.currentRatioMin !== undefined || clientFilters.currentRatioMax !== undefined ||
        clientFilters.quickRatioMin !== undefined || clientFilters.quickRatioMax !== undefined ||
        clientFilters.cashRatioMin !== undefined || clientFilters.cashRatioMax !== undefined ||
        // Debt/Leverage
        clientFilters.debtRatioMin !== undefined || clientFilters.debtRatioMax !== undefined ||
        clientFilters.debtEquityMin !== undefined || clientFilters.debtEquityMax !== undefined ||
        clientFilters.interestCoverageMin !== undefined || clientFilters.interestCoverageMax !== undefined ||
        // Efficiency
        clientFilters.assetTurnoverMin !== undefined || clientFilters.assetTurnoverMax !== undefined ||
        clientFilters.inventoryTurnoverMin !== undefined || clientFilters.inventoryTurnoverMax !== undefined ||
        // Per Share
        clientFilters.fcfPerShareMin !== undefined || clientFilters.fcfPerShareMax !== undefined ||
        clientFilters.payoutRatioMin !== undefined || clientFilters.payoutRatioMax !== undefined
      );

      const enrichedResults = await enrichWithQuotes(screenerResults, operationId, needsFundamentalData);
      if (operationRef.current !== operationId) return;

      // Debug: log enrichment results
      const withPE = enrichedResults.filter(s => s.pe !== undefined && s.pe !== null && s.pe > 0);
      console.log(`[Screener] Enriched ${enrichedResults.length} stocks, ${withPE.length} have valid P/E`);
      if (withPE.length > 0) {
        console.log('[Screener] Sample P/E values:', withPE.slice(0, 5).map(s => ({ symbol: s.symbol, pe: s.pe })));
      }

      // Step 3: Apply client-side filters
      const filteredResults = applyClientFilters(enrichedResults, clientFilters);
      console.log(`[Screener] After client filters: ${filteredResults.length} results`);

      // Step 4: Sort results
      const sortedResults = sortResults(filteredResults, sortField, sortDirection);

      setResults(sortedResults);
      setTotalResults(sortedResults.length);
      setEnriching(false);
    } catch (err) {
      if (operationRef.current !== operationId) return;
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      setEnriching(false);
    }
  }, [enrichWithQuotes, applyClientFilters, sortResults, sortField, sortDirection]);

  // Handle sort changes
  const setSort = useCallback((field: SortField) => {
    setSortField(prevField => {
      if (prevField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('desc');
      return field;
    });

    // Re-sort existing results
    setResults(prev => sortResults(prev, field, sortField === field && sortDirection === 'desc' ? 'asc' : 'desc'));
  }, [sortResults, sortField, sortDirection]);

  // Reset state
  const reset = useCallback(() => {
    operationRef.current++;
    setResults([]);
    setTotalResults(0);
    setLoading(false);
    setEnriching(false);
    setError(null);
    setCurrentPage(1);
    setSortField('marketCap');
    setSortDirection('desc');
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginatedResults = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return {
    results,
    totalResults,
    paginatedResults,
    loading,
    enriching,
    error,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    sortField,
    sortDirection,
    setSort,
    runScreen,
    reset,
  };
}
