import { describe, it, expect } from 'vitest';
import { fmp } from '../services/fmp';

// Define the indices we're testing (only non-premium indices with live data)
const INDICES_TO_TEST = [
  { symbol: '^DJI', name: 'Dow Jones Industrial Average' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ Composite' },
  { symbol: '^RUT', name: 'Russell 2000' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '^N225', name: 'Nikkei 225' },
  { symbol: '^HSI', name: 'Hang Seng Index' },
  { symbol: '^STOXX50E', name: 'Euro STOXX 50' },
  { symbol: '^VIX', name: 'CBOE Volatility Index' },
];

// Helper to get date string N days ago
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

describe('World Equity Index - Live Data Validation', () => {
  describe('Index Quote Data', () => {
    INDICES_TO_TEST.forEach(({ symbol, name }) => {
      it(`${symbol} (${name}) - should return valid quote data`, async () => {
        const data = await fmp.indexQuote(symbol);

        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        const quote = data[0];

        // Verify essential fields exist
        expect(quote.symbol).toBe(symbol);
        expect(quote.name).toBeDefined();
        expect(typeof quote.price).toBe('number');
        expect(quote.price).toBeGreaterThan(0);

        // Verify change data
        expect(typeof quote.change).toBe('number');
        expect(typeof quote.changePercentage).toBe('number');

        // Verify day range
        expect(typeof quote.dayLow).toBe('number');
        expect(typeof quote.dayHigh).toBe('number');
        expect(quote.dayLow).toBeLessThanOrEqual(quote.dayHigh);

        // Verify year range
        expect(typeof quote.yearLow).toBe('number');
        expect(typeof quote.yearHigh).toBe('number');
        expect(quote.yearLow).toBeLessThanOrEqual(quote.yearHigh);

        // Price should be within year range (with some tolerance for after-hours)
        expect(quote.price).toBeGreaterThanOrEqual(quote.yearLow * 0.95);
        expect(quote.price).toBeLessThanOrEqual(quote.yearHigh * 1.05);

        console.log(`✓ ${symbol}: ${quote.name} @ ${quote.price} (${quote.changePercentage >= 0 ? '+' : ''}${quote.changePercentage.toFixed(2)}%)`);
      }, 15000);
    });
  });

  describe('Historical Price Data for Change Calculations', () => {
    INDICES_TO_TEST.forEach(({ symbol, name: _name }) => {
      it(`${symbol} - should have historical data for 1 week change`, async () => {
        const fromDate = getDateDaysAgo(10); // Extra days for weekends
        const data = await fmp.historicalPriceLight(symbol, fromDate);

        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        // Should have at least 5 trading days of data
        expect(data.length).toBeGreaterThanOrEqual(5);

        // Verify data structure
        const firstEntry = data[0];
        expect(firstEntry.symbol).toBe(symbol);
        expect(firstEntry.date).toBeDefined();
        expect(typeof firstEntry.price).toBe('number');
        expect(firstEntry.price).toBeGreaterThan(0);

        // Verify dates are in descending order (newest first)
        if (data.length > 1) {
          const firstDate = new Date(data[0].date);
          const secondDate = new Date(data[1].date);
          expect(firstDate.getTime()).toBeGreaterThan(secondDate.getTime());
        }

        console.log(`✓ ${symbol}: ${data.length} days of historical data`);
      }, 15000);

      it(`${symbol} - should have historical data for 1 month change`, async () => {
        const fromDate = getDateDaysAgo(35); // Extra days for weekends/holidays
        const data = await fmp.historicalPriceLight(symbol, fromDate);

        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);

        // Should have at least 20 trading days of data for a month
        expect(data.length).toBeGreaterThanOrEqual(15);

        // Get current price from quote
        const quoteData = await fmp.indexQuote(symbol);
        const currentPrice = quoteData[0].price;

        // Find price approximately 30 days ago
        const targetDate = getDateDaysAgo(30);
        const priceMonthAgo = data.find(d => d.date <= targetDate)?.price;

        if (priceMonthAgo) {
          const monthlyChange = ((currentPrice - priceMonthAgo) / priceMonthAgo) * 100;
          // Monthly change should be reasonable (-50% to +50%)
          expect(Math.abs(monthlyChange)).toBeLessThan(50);
          console.log(`✓ ${symbol}: 1M change = ${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(2)}%`);
        }
      }, 20000);
    });
  });

  describe('Data Consistency Checks', () => {
    it('should have consistent 24h change calculation', async () => {
      const symbol = '^DJI';
      const quoteData = await fmp.indexQuote(symbol);
      const quote = quoteData[0];

      // 24h change should match: (price - previousClose) / previousClose * 100
      const calculatedChange = ((quote.price - quote.previousClose) / quote.previousClose) * 100;

      // Allow small tolerance due to rounding
      expect(Math.abs(calculatedChange - quote.changePercentage)).toBeLessThan(0.1);

      console.log(`✓ 24h change validation: API=${quote.changePercentage.toFixed(4)}%, Calculated=${calculatedChange.toFixed(4)}%`);
    }, 15000);

    it('should have reasonable index values for major indices', async () => {
      // S&P 500 should be between 1000 and 20000 (reasonable 2024-2030 range)
      const spData = await fmp.indexQuote('^GSPC');
      expect(spData[0].price).toBeGreaterThan(1000);
      expect(spData[0].price).toBeLessThan(20000);

      // Dow should be between 10000 and 100000
      const djData = await fmp.indexQuote('^DJI');
      expect(djData[0].price).toBeGreaterThan(10000);
      expect(djData[0].price).toBeLessThan(100000);

      // NASDAQ should be between 5000 and 50000
      const nasdaqData = await fmp.indexQuote('^IXIC');
      expect(nasdaqData[0].price).toBeGreaterThan(5000);
      expect(nasdaqData[0].price).toBeLessThan(50000);

      // Nikkei should be between 10000 and 100000
      const nikkeiData = await fmp.indexQuote('^N225');
      expect(nikkeiData[0].price).toBeGreaterThan(10000);
      expect(nikkeiData[0].price).toBeLessThan(100000);

      console.log('✓ All major indices within expected value ranges');
    }, 30000);
  });

  describe('Time Period Validation', () => {
    it('should calculate correct 1-week change from historical data', async () => {
      const symbol = '^GSPC';

      // Get current price
      const quoteData = await fmp.indexQuote(symbol);
      const currentPrice = quoteData[0].price;

      // Get historical data
      const fromDate = getDateDaysAgo(10);
      const historicalData = await fmp.historicalPriceLight(symbol, fromDate);

      // Find price closest to 7 days ago
      const targetDate = getDateDaysAgo(7);
      let priceOneWeekAgo: number | undefined;
      for (const item of historicalData) {
        if (item.date <= targetDate) {
          priceOneWeekAgo = item.price;
          break;
        }
      }

      expect(priceOneWeekAgo).toBeDefined();

      if (priceOneWeekAgo) {
        const weeklyChange = ((currentPrice - priceOneWeekAgo) / priceOneWeekAgo) * 100;
        // Weekly change should be reasonable (-20% to +20%)
        expect(Math.abs(weeklyChange)).toBeLessThan(20);
        console.log(`✓ S&P 500 1W change: ${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(2)}% (from ${priceOneWeekAgo} to ${currentPrice})`);
      }
    }, 20000);

    it('should calculate correct 1-month change from historical data', async () => {
      const symbol = '^GSPC';

      // Get current price
      const quoteData = await fmp.indexQuote(symbol);
      const currentPrice = quoteData[0].price;

      // Get historical data
      const fromDate = getDateDaysAgo(35);
      const historicalData = await fmp.historicalPriceLight(symbol, fromDate);

      // Find price closest to 30 days ago
      const targetDate = getDateDaysAgo(30);
      let priceOneMonthAgo: number | undefined;
      for (const item of historicalData) {
        if (item.date <= targetDate) {
          priceOneMonthAgo = item.price;
          break;
        }
      }

      expect(priceOneMonthAgo).toBeDefined();

      if (priceOneMonthAgo) {
        const monthlyChange = ((currentPrice - priceOneMonthAgo) / priceOneMonthAgo) * 100;
        // Monthly change should be reasonable (-30% to +30%)
        expect(Math.abs(monthlyChange)).toBeLessThan(30);
        console.log(`✓ S&P 500 1M change: ${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(2)}% (from ${priceOneMonthAgo} to ${currentPrice})`);
      }
    }, 20000);
  });
});
