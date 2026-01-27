import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';

export interface Commodity {
  symbol: string;
  name: string;
  displaySymbol: string;
  category: 'Grain' | 'Softs' | 'Metals' | 'Meat' | 'Energy';
  isPremium?: boolean;
}

export interface CommodityData extends Commodity {
  price: number | null;
  change: number | null;
  changePct: number | null;
  ytdPct: number | null;
  loading: boolean;
  error: string | null;
}

// Define all commodities we want to track
// isPremium: true means the commodity requires a higher FMP subscription tier
export const COMMODITIES: Commodity[] = [
  // Grain
  { symbol: 'ZRUSX', displaySymbol: 'ZR1', name: 'Rough Rice', category: 'Grain', isPremium: true },
  { symbol: 'ZSUSX', displaySymbol: 'ZS1', name: 'Soybean', category: 'Grain', isPremium: true },
  { symbol: 'ZCUSX', displaySymbol: 'ZC1', name: 'Corn', category: 'Grain', isPremium: true },
  { symbol: 'KEUSX', displaySymbol: 'KE1', name: 'Wheat', category: 'Grain', isPremium: true },
  { symbol: 'ZOUSX', displaySymbol: 'ZO1', name: 'Oats', category: 'Grain', isPremium: true },
  // Softs
  { symbol: 'KCUSX', displaySymbol: 'KC1', name: 'Coffee Futures', category: 'Softs', isPremium: true },
  { symbol: 'CTUSX', displaySymbol: 'CT1', name: 'Cotton Futures', category: 'Softs', isPremium: true },
  { symbol: 'CCUSD', displaySymbol: 'CC1', name: 'Cocoa Futures', category: 'Softs', isPremium: true },
  { symbol: 'SBUSX', displaySymbol: 'SB1', name: 'Sugar Futures', category: 'Softs', isPremium: true },
  // Metals
  { symbol: 'GCUSD', displaySymbol: 'GC1', name: 'Gold', category: 'Metals', isPremium: false },
  { symbol: 'SIUSD', displaySymbol: 'SI1', name: 'Silver', category: 'Metals', isPremium: false },
  { symbol: 'PLUSD', displaySymbol: 'PL1', name: 'Platinum', category: 'Metals', isPremium: true },
  { symbol: 'HGUSD', displaySymbol: 'HG1', name: 'High Grade Copper', category: 'Metals', isPremium: true },
  { symbol: 'PAUSD', displaySymbol: 'PA1', name: 'Palladium', category: 'Metals', isPremium: true },
  // Meat
  { symbol: 'LEUSX', displaySymbol: 'LE1', name: 'Live Cattle', category: 'Meat', isPremium: true },
  { symbol: 'GFUSX', displaySymbol: 'GF1', name: 'Feeder Cattle', category: 'Meat', isPremium: true },
  { symbol: 'HEUSX', displaySymbol: 'HE1', name: 'Lean Hogs', category: 'Meat', isPremium: true },
  // Energy
  { symbol: 'BZUSD', displaySymbol: 'CL1', name: 'Crude Oil (Brent)', category: 'Energy', isPremium: false },
  { symbol: 'NGUSD', displaySymbol: 'NG1', name: 'Natural Gas', category: 'Energy', isPremium: true },
];

export function useCommodities() {
  const [data, setData] = useState<CommodityData[]>(
    COMMODITIES.map(commodity => ({
      ...commodity,
      price: null,
      change: null,
      changePct: null,
      ytdPct: null,
      loading: true,
      error: null,
    }))
  );

  useEffect(() => {
    const fetchCommodityData = async (commodity: Commodity): Promise<Partial<CommodityData>> => {
      // Skip API calls for premium commodities
      if (commodity.isPremium) {
        return {
          price: null,
          change: null,
          changePct: null,
          ytdPct: null,
          loading: false,
          error: 'Premium subscription required',
        };
      }

      try {
        // Fetch current quote
        const quoteData = await fmp.commodityQuote(commodity.symbol);
        if (!quoteData || quoteData.length === 0) {
          return { loading: false, error: 'No data available' };
        }

        const quote = quoteData[0];

        // Calculate YTD % (approximation using 200-day average as proxy)
        // In a real implementation, you'd fetch the price from Jan 1st
        const ytdPct = quote.priceAvg200
          ? ((quote.price - quote.priceAvg200) / quote.priceAvg200) * 100
          : null;

        return {
          price: quote.price,
          change: quote.change,
          changePct: quote.changesPercentage,
          ytdPct,
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

    // Fetch all commodities
    const fetchAll = async () => {
      const results = await Promise.all(
        COMMODITIES.map(async (commodity) => {
          const result = await fetchCommodityData(commodity);
          return { ...commodity, ...result } as CommodityData;
        })
      );
      setData(results);
    };

    fetchAll();
  }, []);

  return { data };
}
