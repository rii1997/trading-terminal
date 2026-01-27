import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { HistoricalPriceLight } from '../types/fmp';

export interface WorldIndex {
  symbol: string;
  name: string;
  displaySymbol: string;
  region: 'Americas' | 'EMEA' | 'Asia/Pacific' | 'Volatility';
  isPremium?: boolean;
}

export interface WorldIndexData extends WorldIndex {
  price: number | null;
  change24h: number | null;
  changePct24h: number | null;
  changePct1W: number | null;
  changePct1M: number | null;
  loading: boolean;
  error: string | null;
}

// Define all world indices we want to track
// isPremium: true means the index requires a higher FMP subscription tier
export const WORLD_INDICES: WorldIndex[] = [
  // Americas
  { symbol: '^DJI', displaySymbol: 'DJI', name: 'Dow Jones Industrial Average', region: 'Americas' },
  { symbol: '^GSPC', displaySymbol: 'SPX', name: "Standard & Poor's 500", region: 'Americas' },
  { symbol: '^IXIC', displaySymbol: 'IXIC', name: 'NASDAQ Composite', region: 'Americas' },
  { symbol: '^RUT', displaySymbol: 'RUT', name: 'Russell 2000', region: 'Americas' },
  { symbol: '^GSPTSE', displaySymbol: 'TSX', name: 'S&P/TSX Composite', region: 'Americas', isPremium: true },
  { symbol: '^BVSP', displaySymbol: 'BVSP', name: 'Bovespa Index', region: 'Americas', isPremium: true },
  { symbol: '^MXX', displaySymbol: 'MXX', name: 'IPC Mexico', region: 'Americas', isPremium: true },
  // EMEA
  { symbol: '^STOXX50E', displaySymbol: 'STOXX50E', name: 'Euro STOXX 50', region: 'EMEA' },
  { symbol: '^FTSE', displaySymbol: 'FTSE', name: 'FTSE 100', region: 'EMEA' },
  { symbol: '^GDAXI', displaySymbol: 'DAX', name: 'DAX 40', region: 'EMEA', isPremium: true },
  { symbol: '^FCHI', displaySymbol: 'CAC', name: 'CAC 40', region: 'EMEA', isPremium: true },
  { symbol: '^IBEX', displaySymbol: 'IBEX', name: 'IBEX 35', region: 'EMEA', isPremium: true },
  { symbol: '^FTSEMIB', displaySymbol: 'MIB', name: 'FTSE MIB', region: 'EMEA', isPremium: true },
  { symbol: '^SSMI', displaySymbol: 'SMI', name: 'Swiss Market Index', region: 'EMEA', isPremium: true },
  { symbol: '^AEX', displaySymbol: 'AEX', name: 'AEX Amsterdam', region: 'EMEA', isPremium: true },
  // Asia/Pacific
  { symbol: '^N225', displaySymbol: 'N225', name: 'Nikkei 225', region: 'Asia/Pacific' },
  { symbol: '^HSI', displaySymbol: 'HSI', name: 'Hang Seng Index', region: 'Asia/Pacific' },
  { symbol: '^SSEC', displaySymbol: 'SHCOMP', name: 'Shanghai Composite', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^CSI300', displaySymbol: 'CSI300', name: 'CSI 300', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^KS11', displaySymbol: 'KOSPI', name: 'KOSPI', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^TWII', displaySymbol: 'TAIEX', name: 'Taiwan Weighted', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^AXJO', displaySymbol: 'ASX', name: 'S&P/ASX 200', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^BSESN', displaySymbol: 'SENSEX', name: 'BSE Sensex', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^NSEI', displaySymbol: 'NIFTY', name: 'Nifty 50', region: 'Asia/Pacific', isPremium: true },
  { symbol: '^STI', displaySymbol: 'STI', name: 'Straits Times Index', region: 'Asia/Pacific', isPremium: true },
  // Volatility
  { symbol: '^VIX', displaySymbol: 'VIX', name: 'CBOE Volatility Index', region: 'Volatility' },
];

// Calculate percentage change between two prices
function calcPctChange(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Get date string N days ago
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Find price closest to target date
function findPriceOnOrBefore(data: HistoricalPriceLight[], targetDate: string): number | null {
  // Data is sorted newest first
  for (const item of data) {
    if (item.date <= targetDate) {
      return item.price;
    }
  }
  return data.length > 0 ? data[data.length - 1].price : null;
}

export function useWorldIndices() {
  const [data, setData] = useState<WorldIndexData[]>(
    WORLD_INDICES.map(idx => ({
      ...idx,
      price: null,
      change24h: null,
      changePct24h: null,
      changePct1W: null,
      changePct1M: null,
      loading: true,
      error: null,
    }))
  );

  useEffect(() => {
    const fetchIndexData = async (index: WorldIndex): Promise<Partial<WorldIndexData>> => {
      // Skip API calls for premium indices - return N/A data
      if (index.isPremium) {
        return {
          price: null,
          change24h: null,
          changePct24h: null,
          changePct1W: null,
          changePct1M: null,
          loading: false,
          error: 'Premium subscription required',
        };
      }

      try {
        // Fetch current quote
        const quoteData = await fmp.indexQuote(index.symbol);
        if (!quoteData || quoteData.length === 0) {
          return { loading: false, error: 'No data available' };
        }

        const quote = quoteData[0];
        const currentPrice = quote.price;
        const change24h = quote.change;
        const changePct24h = quote.changePercentage;

        // Fetch historical data for 1W and 1M calculations
        const fromDate = getDateDaysAgo(35); // Get extra days for weekends/holidays
        const historicalData = await fmp.historicalPriceLight(index.symbol, fromDate);

        // Calculate 1 week change (7 days ago)
        const oneWeekAgoDate = getDateDaysAgo(7);
        const priceOneWeekAgo = findPriceOnOrBefore(historicalData, oneWeekAgoDate);
        const changePct1W = priceOneWeekAgo ? calcPctChange(currentPrice, priceOneWeekAgo) : null;

        // Calculate 1 month change (30 days ago)
        const oneMonthAgoDate = getDateDaysAgo(30);
        const priceOneMonthAgo = findPriceOnOrBefore(historicalData, oneMonthAgoDate);
        const changePct1M = priceOneMonthAgo ? calcPctChange(currentPrice, priceOneMonthAgo) : null;

        return {
          price: currentPrice,
          change24h,
          changePct24h,
          changePct1W,
          changePct1M,
          loading: false,
          error: null,
        };
      } catch (err) {
        return {
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch',
        };
      }
    };

    // Fetch all indices
    const fetchAll = async () => {
      const results = await Promise.all(
        WORLD_INDICES.map(async (index) => {
          const result = await fetchIndexData(index);
          return { ...index, ...result } as WorldIndexData;
        })
      );
      setData(results);
    };

    fetchAll();
  }, []);

  return { data };
}
