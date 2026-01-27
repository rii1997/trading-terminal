import { describe, it, expect } from 'vitest';

// Direct API testing without the service layer (to avoid import.meta.env issues)
const FMP_BASE = 'https://financialmodelingprep.com/stable';
const API_KEY = 'MNXIc1L6ErRplAg1iI8t4xoIOY5Cv01W';

async function fetchFMP<T>(endpoint: string): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${FMP_BASE}${endpoint}${separator}apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FMP API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

const TEST_SYMBOL = 'AAPL';

describe('FMP API Integration Tests', () => {
  describe('Profile Endpoint', () => {
    it('should return valid company profile data', async () => {
      const data = await fetchFMP<any[]>(`/profile?symbol=${TEST_SYMBOL}`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const profile = data[0];
      expect(profile.symbol).toBe(TEST_SYMBOL);
      expect(profile.companyName).toBeTruthy();
      expect(profile.exchange).toBeTruthy();
      expect(profile.industry).toBeTruthy();
      expect(profile.sector).toBeTruthy();

      console.log('✓ Profile data:', {
        symbol: profile.symbol,
        name: profile.companyName,
        exchange: profile.exchange,
        sector: profile.sector,
      });
    });
  });

  describe('Quote Endpoint', () => {
    it('should return valid real-time quote data', async () => {
      const data = await fetchFMP<any[]>(`/quote?symbol=${TEST_SYMBOL}`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const quote = data[0];
      expect(quote.symbol).toBe(TEST_SYMBOL);
      expect(typeof quote.price).toBe('number');
      expect(quote.price).toBeGreaterThan(0);
      expect(typeof quote.change).toBe('number');
      expect(typeof quote.volume).toBe('number');
      expect(typeof quote.marketCap).toBe('number');

      // Check data freshness (timestamp should be recent - within 24 hours for market data)
      if (quote.timestamp) {
        const dataAge = Date.now() - (quote.timestamp * 1000);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms
        expect(dataAge).toBeLessThan(maxAge);

        console.log('✓ Quote data freshness:', {
          timestamp: new Date(quote.timestamp * 1000).toISOString(),
          ageSeconds: Math.floor(dataAge / 1000),
        });
      }

      console.log('✓ Quote data:', {
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        volume: quote.volume,
      });
    });

    it('should have reasonable price values', async () => {
      const data = await fetchFMP<any[]>(`/quote?symbol=${TEST_SYMBOL}`);
      const quote = data[0];

      // Price sanity checks
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.price).toBeLessThan(10000);
      expect(quote.dayLow).toBeLessThanOrEqual(quote.dayHigh);
      expect(quote.yearLow).toBeLessThanOrEqual(quote.yearHigh);
    });
  });

  describe('Key Metrics Endpoint', () => {
    it('should return valid financial metrics', async () => {
      const data = await fetchFMP<any[]>(`/key-metrics?symbol=${TEST_SYMBOL}&limit=1`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const metrics = data[0];
      expect(metrics.symbol).toBe(TEST_SYMBOL);
      expect(typeof metrics.marketCap).toBe('number');
      expect(typeof metrics.enterpriseValue).toBe('number');

      console.log('✓ Key Metrics:', {
        symbol: metrics.symbol,
        date: metrics.date,
        marketCap: metrics.marketCap,
        enterpriseValue: metrics.enterpriseValue,
        peRatio: metrics.peRatio,
      });
    });
  });

  describe('Ratios Endpoint', () => {
    it('should return valid financial ratios', async () => {
      const data = await fetchFMP<any[]>(`/ratios?symbol=${TEST_SYMBOL}&limit=1`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const ratios = data[0];
      expect(ratios.symbol).toBe(TEST_SYMBOL);

      console.log('✓ Ratios:', {
        symbol: ratios.symbol,
        date: ratios.date,
        priceToSalesRatio: ratios.priceToSalesRatio,
        priceToBookRatio: ratios.priceToBookRatio,
      });
    });
  });

  describe('Analyst Grades Endpoint', () => {
    it('should return analyst ratings', async () => {
      const data = await fetchFMP<any[]>(`/grades?symbol=${TEST_SYMBOL}&limit=5`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const grade = data[0];
        expect(grade.symbol).toBe(TEST_SYMBOL);
        expect(grade.gradingCompany).toBeTruthy();
        expect(grade.newGrade).toBeTruthy();
        expect(grade.date).toBeTruthy();

        // Check date is recent (within last year)
        const gradeDate = new Date(grade.date);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        expect(gradeDate.getTime()).toBeGreaterThan(oneYearAgo.getTime());

        console.log('✓ Analyst Grades (first 3):', data.slice(0, 3).map(g => ({
          firm: g.gradingCompany,
          grade: g.newGrade,
          date: g.date,
        })));
      }
    });
  });

  describe('Historical Price Endpoint', () => {
    it('should return historical OHLCV data', async () => {
      const data = await fetchFMP<any[]>(`/historical-price-eod/full?symbol=${TEST_SYMBOL}`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const latest = data[0];
      expect(latest.date).toBeTruthy();
      expect(typeof latest.open).toBe('number');
      expect(typeof latest.high).toBe('number');
      expect(typeof latest.low).toBe('number');
      expect(typeof latest.close).toBe('number');
      expect(typeof latest.volume).toBe('number');

      // OHLC sanity checks
      expect(latest.low).toBeLessThanOrEqual(latest.high);
      expect(latest.open).toBeGreaterThanOrEqual(latest.low);
      expect(latest.open).toBeLessThanOrEqual(latest.high);
      expect(latest.close).toBeGreaterThanOrEqual(latest.low);
      expect(latest.close).toBeLessThanOrEqual(latest.high);

      // Check data is recent
      const latestDate = new Date(latest.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      expect(latestDate.getTime()).toBeGreaterThan(weekAgo.getTime());

      console.log('✓ Historical Price (latest):', {
        date: latest.date,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        close: latest.close,
        volume: latest.volume,
      });
      console.log(`  Total records: ${data.length}`);
    });
  });

  describe('Search Endpoint', () => {
    it('should return search results for company name', async () => {
      const data = await fetchFMP<any[]>(`/search-name?query=Apple&limit=10`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Should find AAPL or AAPL-related symbol in results
      const appleResult = data.find(r => r.symbol?.includes('AAPL'));
      expect(appleResult).toBeDefined();

      // Verify results contain Apple-related companies
      const hasAppleCompany = data.some(r =>
        r.name?.toLowerCase().includes('apple') || r.symbol?.includes('AAPL')
      );
      expect(hasAppleCompany).toBe(true);

      console.log('✓ Search results for "Apple":', data.slice(0, 5).map(r => ({
        symbol: r.symbol,
        name: r.name,
        exchange: r.exchangeShortName,
      })));
    });
  });

  describe('Analyst Estimates Endpoint', () => {
    it('should return EPS estimates', async () => {
      const data = await fetchFMP<any[]>(`/analyst-estimates?symbol=${TEST_SYMBOL}&period=annual&limit=2`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const estimate = data[0];
        expect(estimate.symbol).toBe(TEST_SYMBOL);

        console.log('✓ Analyst Estimates:', data.map(e => ({
          date: e.date,
          epsAvg: e.epsAvg,
          revenueAvg: e.revenueAvg,
        })));
      }
    });
  });
});

describe('Data Consistency Tests', () => {
  it('should have consistent price data between quote and profile', async () => {
    const [profileData, quoteData] = await Promise.all([
      fetchFMP<any[]>(`/profile?symbol=${TEST_SYMBOL}`),
      fetchFMP<any[]>(`/quote?symbol=${TEST_SYMBOL}`),
    ]);

    const profile = profileData[0];
    const quote = quoteData[0];

    // Prices should be within 1% of each other
    const priceDiff = Math.abs(profile.price - quote.price) / quote.price;
    expect(priceDiff).toBeLessThan(0.01);

    console.log('✓ Price consistency:', {
      profilePrice: profile.price,
      quotePrice: quote.price,
      difference: `${(priceDiff * 100).toFixed(2)}%`,
    });
  });

  it('should have market cap consistency', async () => {
    const [quoteData, metricsData] = await Promise.all([
      fetchFMP<any[]>(`/quote?symbol=${TEST_SYMBOL}`),
      fetchFMP<any[]>(`/key-metrics?symbol=${TEST_SYMBOL}&limit=1`),
    ]);

    const quote = quoteData[0];
    const metrics = metricsData[0];

    // Market caps should be within 15% (metrics might be from last fiscal period)
    const marketCapDiff = Math.abs(quote.marketCap - metrics.marketCap) / quote.marketCap;
    expect(marketCapDiff).toBeLessThan(0.15);

    console.log('✓ Market Cap consistency:', {
      quoteMarketCap: quote.marketCap,
      metricsMarketCap: metrics.marketCap,
      difference: `${(marketCapDiff * 100).toFixed(2)}%`,
    });
  });
});

describe('Financial Statement Tests', () => {
  describe('Income Statement', () => {
    it('should return valid quarterly income statement data', async () => {
      const data = await fetchFMP<any[]>(`/income-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=4`);

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      const latest = data[0];
      expect(latest.symbol).toBe(TEST_SYMBOL);
      expect(latest.date).toBeTruthy();
      expect(latest.period).toMatch(/Q[1-4]/);
      expect(typeof latest.revenue).toBe('number');
      expect(typeof latest.grossProfit).toBe('number');
      expect(typeof latest.netIncome).toBe('number');
      expect(latest.revenue).toBeGreaterThan(0);

      // Gross profit should be less than revenue
      expect(latest.grossProfit).toBeLessThanOrEqual(latest.revenue);

      // Check data is from recent quarters
      const latestDate = new Date(latest.date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      expect(latestDate.getTime()).toBeGreaterThan(oneYearAgo.getTime());

      console.log('✓ Income Statement (quarterly):', {
        date: latest.date,
        period: latest.period,
        revenue: (latest.revenue / 1e9).toFixed(2) + 'B',
        grossProfit: (latest.grossProfit / 1e9).toFixed(2) + 'B',
        netIncome: (latest.netIncome / 1e9).toFixed(2) + 'B',
        grossMargin: ((latest.grossProfit / latest.revenue) * 100).toFixed(1) + '%',
      });
    });

    it('should return valid annual income statement data', async () => {
      const data = await fetchFMP<any[]>(`/income-statement?symbol=${TEST_SYMBOL}&period=annual&limit=3`);

      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      const latest = data[0];
      expect(latest.period).toBe('FY');
      expect(typeof latest.revenue).toBe('number');

      // Annual revenue should be larger than quarterly
      const quarterlyData = await fetchFMP<any[]>(`/income-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`);
      expect(latest.revenue).toBeGreaterThan(quarterlyData[0].revenue);

      console.log('✓ Income Statement (annual):', {
        fiscalYear: latest.fiscalYear,
        revenue: (latest.revenue / 1e9).toFixed(2) + 'B',
        netIncome: (latest.netIncome / 1e9).toFixed(2) + 'B',
      });
    });
  });

  describe('Balance Sheet', () => {
    it('should return valid balance sheet data', async () => {
      const data = await fetchFMP<any[]>(`/balance-sheet-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`);

      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      const latest = data[0];
      expect(latest.symbol).toBe(TEST_SYMBOL);
      expect(typeof latest.totalAssets).toBe('number');
      expect(typeof latest.totalLiabilities).toBe('number');
      expect(typeof latest.totalStockholdersEquity).toBe('number');
      expect(latest.totalAssets).toBeGreaterThan(0);

      // Assets = Liabilities + Equity (basic accounting equation)
      const assetsMinusLiabilitiesEquity = Math.abs(
        latest.totalAssets - (latest.totalLiabilities + latest.totalStockholdersEquity)
      );
      const tolerance = latest.totalAssets * 0.01; // 1% tolerance for rounding
      expect(assetsMinusLiabilitiesEquity).toBeLessThan(tolerance);

      console.log('✓ Balance Sheet:', {
        date: latest.date,
        totalAssets: (latest.totalAssets / 1e9).toFixed(2) + 'B',
        totalLiabilities: (latest.totalLiabilities / 1e9).toFixed(2) + 'B',
        totalEquity: (latest.totalStockholdersEquity / 1e9).toFixed(2) + 'B',
        cashAndEquivalents: (latest.cashAndCashEquivalents / 1e9).toFixed(2) + 'B',
      });
    });
  });

  describe('Cash Flow Statement', () => {
    it('should return valid cash flow data', async () => {
      const data = await fetchFMP<any[]>(`/cash-flow-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`);

      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      const latest = data[0];
      expect(latest.symbol).toBe(TEST_SYMBOL);
      expect(typeof latest.netCashProvidedByOperatingActivities).toBe('number');
      expect(typeof latest.netCashProvidedByInvestingActivities).toBe('number');
      expect(typeof latest.netCashProvidedByFinancingActivities).toBe('number');
      expect(typeof latest.freeCashFlow).toBe('number');

      // Net change in cash should approximately equal sum of activities + forex
      const calculatedChange =
        latest.netCashProvidedByOperatingActivities +
        latest.netCashProvidedByInvestingActivities +
        latest.netCashProvidedByFinancingActivities +
        (latest.effectOfForexChangesOnCash || 0);
      const reportedChange = latest.netChangeInCash;
      const difference = Math.abs(calculatedChange - reportedChange);
      const tolerance = Math.abs(reportedChange) * 0.05 || 1e6; // 5% tolerance
      expect(difference).toBeLessThan(tolerance);

      console.log('✓ Cash Flow Statement:', {
        date: latest.date,
        operatingCF: (latest.netCashProvidedByOperatingActivities / 1e9).toFixed(2) + 'B',
        investingCF: (latest.netCashProvidedByInvestingActivities / 1e9).toFixed(2) + 'B',
        financingCF: (latest.netCashProvidedByFinancingActivities / 1e9).toFixed(2) + 'B',
        freeCashFlow: (latest.freeCashFlow / 1e9).toFixed(2) + 'B',
      });
    });
  });

  describe('Financial Data Consistency', () => {
    it('should have consistent net income between income and cash flow statements', async () => {
      const [incomeData, cashFlowData] = await Promise.all([
        fetchFMP<any[]>(`/income-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`),
        fetchFMP<any[]>(`/cash-flow-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`),
      ]);

      const incomeNetIncome = incomeData[0].netIncome;
      const cashFlowNetIncome = cashFlowData[0].netIncome;

      // Net income should be the same on both statements
      expect(incomeNetIncome).toBe(cashFlowNetIncome);

      console.log('✓ Net Income consistency:', {
        incomeStatement: (incomeNetIncome / 1e9).toFixed(2) + 'B',
        cashFlowStatement: (cashFlowNetIncome / 1e9).toFixed(2) + 'B',
        match: incomeNetIncome === cashFlowNetIncome,
      });
    });

    it('should have matching dates across all three statements', async () => {
      const [incomeData, balanceData, cashFlowData] = await Promise.all([
        fetchFMP<any[]>(`/income-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`),
        fetchFMP<any[]>(`/balance-sheet-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`),
        fetchFMP<any[]>(`/cash-flow-statement?symbol=${TEST_SYMBOL}&period=quarter&limit=1`),
      ]);

      const incomeDate = incomeData[0].date;
      const balanceDate = balanceData[0].date;
      const cashFlowDate = cashFlowData[0].date;

      expect(incomeDate).toBe(balanceDate);
      expect(balanceDate).toBe(cashFlowDate);

      console.log('✓ Statement dates match:', {
        incomeStatement: incomeDate,
        balanceSheet: balanceDate,
        cashFlow: cashFlowDate,
      });
    });
  });
});

describe('Data Freshness Tests', () => {
  it('quote timestamp should be from today or last trading day', async () => {
    const data = await fetchFMP<any[]>(`/quote?symbol=${TEST_SYMBOL}`);
    const quote = data[0];

    if (quote.timestamp) {
      const dataDate = new Date(quote.timestamp * 1000);
      const now = new Date();

      // Data should be from within last 3 days (accounting for weekends)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      expect(dataDate.getTime()).toBeGreaterThan(threeDaysAgo.getTime());

      console.log('✓ Quote timestamp check:', {
        dataTimestamp: dataDate.toISOString(),
        currentTime: now.toISOString(),
        ageInHours: ((now.getTime() - dataDate.getTime()) / (1000 * 60 * 60)).toFixed(1),
      });
    }
  });

  it('historical data should include recent trading days', async () => {
    const data = await fetchFMP<any[]>(`/historical-price-eod/full?symbol=${TEST_SYMBOL}`);

    const latestDate = new Date(data[0].date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    expect(latestDate.getTime()).toBeGreaterThan(weekAgo.getTime());

    console.log('✓ Historical data freshness:', {
      latestDataDate: data[0].date,
      daysOld: Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)),
    });
  });
});
