import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { IndexConstituent, Quote } from '../../types/fmp';

interface IndexHoldingsProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

type IndexType = 'sp500' | 'nasdaq' | 'dowjones';

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol.replace('.', '')}.png`;
};

// Format market cap
const formatMarketCap = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(0) + 'M';
  return num.toFixed(0);
};

interface EnrichedConstituent extends IndexConstituent {
  price?: number;
  change?: number;
  changesPercentage?: number;
  marketCap?: number;
}

export function IndexHoldings({ onSymbolChange, onOpenDescription }: IndexHoldingsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [constituents, setConstituents] = useState<EnrichedConstituent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<IndexType>('sp500');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sector' | 'marketCap' | 'change'>('marketCap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch constituents based on selected index
      let data: IndexConstituent[];
      switch (selectedIndex) {
        case 'sp500':
          data = await fmp.sp500Constituents();
          break;
        case 'nasdaq':
          data = await fmp.nasdaqConstituents();
          break;
        case 'dowjones':
          data = await fmp.dowjonesConstituents();
          break;
      }

      // Fetch quotes in batches of 50 for all constituents
      const allSymbols = data.map(c => c.symbol);
      const quoteMap = new Map<string, Quote>();

      // Process in batches of 50 (API limit)
      const batchSize = 50;
      for (let i = 0; i < allSymbols.length; i += batchSize) {
        const batch = allSymbols.slice(i, i + batchSize);
        const quotes = await fmp.batchQuote(batch);
        quotes.forEach(q => quoteMap.set(q.symbol, q));
      }

      // Enrich constituents with quote data
      const enriched: EnrichedConstituent[] = data.map(c => {
        const quote = quoteMap.get(c.symbol);
        return {
          ...c,
          price: quote?.price,
          change: quote?.change,
          changesPercentage: quote?.changesPercentage,
          marketCap: quote?.marketCap,
        };
      });

      // Sort by market cap by default
      enriched.sort((a, b) => {
        if (a.marketCap && b.marketCap) return b.marketCap - a.marketCap;
        if (a.marketCap) return -1;
        if (b.marketCap) return 1;
        return a.name.localeCompare(b.name);
      });

      setConstituents(enriched);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch index data');
    } finally {
      setLoading(false);
    }
  }, [selectedIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const indexName = selectedIndex === 'sp500' ? 'S&P 500' :
                        selectedIndex === 'nasdaq' ? 'Nasdaq 100' : 'Dow 30';
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-primary font-medium">{indexName}</span>
          <span className="text-text-secondary">
            {constituents.length} holdings
          </span>
        </div>
      );
      onSymbolChange('index', headerContent);
    }
  }, [selectedIndex, constituents.length, onSymbolChange]);

  // Get unique sectors
  const sectors = ['All', ...new Set(constituents.map(c => c.sector).filter(Boolean).sort())];

  // Filter and sort constituents
  const filteredConstituents = constituents
    .filter(c => {
      if (selectedSector !== 'All' && c.sector !== selectedSector) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return c.symbol.toLowerCase().includes(query) ||
               c.name.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sector':
          comparison = (a.sector || '').localeCompare(b.sector || '');
          break;
        case 'marketCap':
          comparison = (b.marketCap || 0) - (a.marketCap || 0);
          break;
        case 'change':
          comparison = (b.changesPercentage || 0) - (a.changesPercentage || 0);
          break;
      }
      return sortDir === 'asc' ? -comparison : comparison;
    });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border space-y-2">
        {/* Index Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedIndex('sp500')}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                selectedIndex === 'sp500'
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              S&P 500
            </button>
            <button
              onClick={() => setSelectedIndex('nasdaq')}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                selectedIndex === 'nasdaq'
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              Nasdaq 100
            </button>
            <button
              onClick={() => setSelectedIndex('dowjones')}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                selectedIndex === 'dowjones'
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              Dow 30
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
          />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && constituents.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading index holdings...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr className="text-left text-xs text-text-secondary">
                <th className="px-3 py-2 font-medium w-8">#</th>
                <th
                  className="px-3 py-2 font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('name')}
                >
                  Company<SortIcon column="name" />
                </th>
                <th
                  className="px-3 py-2 font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('sector')}
                >
                  Sector<SortIcon column="sector" />
                </th>
                <th className="px-3 py-2 font-medium text-right">Price</th>
                <th
                  className="px-3 py-2 font-medium text-right cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('change')}
                >
                  Change<SortIcon column="change" />
                </th>
                <th
                  className="px-3 py-2 font-medium text-right cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('marketCap')}
                >
                  Mkt Cap<SortIcon column="marketCap" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredConstituents.map((stock, idx) => (
                <tr
                  key={stock.symbol}
                  onClick={() => onOpenDescription?.(stock.symbol)}
                  className="border-b border-border hover:bg-bg-secondary cursor-pointer"
                >
                  <td className="px-3 py-2 text-text-secondary text-xs">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                        <img
                          src={getLogoUrl(stock.symbol)}
                          alt={stock.symbol}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-[10px] text-text-secondary truncate max-w-[180px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs">{stock.sector}</div>
                    <div className="text-[10px] text-text-secondary truncate max-w-[120px]">
                      {stock.subSector}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {stock.price ? `$${stock.price.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${
                    (stock.changesPercentage || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {stock.changesPercentage !== undefined ? (
                      <>
                        {stock.changesPercentage >= 0 ? '+' : ''}
                        {stock.changesPercentage.toFixed(2)}%
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-text-secondary">
                    {stock.marketCap ? formatMarketCap(stock.marketCap) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <span>
          {selectedIndex === 'sp500' && 'S&P 500 Index (SPY ETF equivalent)'}
          {selectedIndex === 'nasdaq' && 'Nasdaq 100 Index (QQQ ETF equivalent)'}
          {selectedIndex === 'dowjones' && 'Dow Jones Industrial Average (DIA ETF equivalent)'}
        </span>
        <span>
          {filteredConstituents.length} of {constituents.length} shown
          {lastUpdate && ` | Updated ${lastUpdate.toLocaleTimeString()}`}
        </span>
      </div>
    </div>
  );
}
