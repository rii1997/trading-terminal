import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { StockNewsItem } from '../../types/fmp';

interface PressReleasesProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
  initialSymbol?: string;
}

// Default watchlist for news
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol.replace('.', '')}.png`;
};

// Format relative time
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get source color
const getSourceColor = (publisher: string): string => {
  const pub = publisher.toLowerCase();
  if (pub.includes('seeking alpha')) return 'text-orange-400';
  if (pub.includes('motley fool')) return 'text-blue-400';
  if (pub.includes('benzinga')) return 'text-green-400';
  if (pub.includes('zacks')) return 'text-purple-400';
  if (pub.includes('reuters')) return 'text-orange-500';
  if (pub.includes('bloomberg')) return 'text-red-400';
  if (pub.includes('cnbc')) return 'text-yellow-400';
  if (pub.includes('yahoo')) return 'text-violet-400';
  return 'text-text-secondary';
};

export function PressReleases({ onSymbolChange, onOpenDescription, initialSymbol }: PressReleasesProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [symbols, setSymbols] = useState<string[]>(() => {
    if (initialSymbol) {
      // Put initialSymbol first in the list
      const others = DEFAULT_SYMBOLS.filter(s => s !== initialSymbol);
      return [initialSymbol, ...others.slice(0, 6)];
    }
    return DEFAULT_SYMBOLS;
  });
  const [inputValue, setInputValue] = useState(() => {
    if (initialSymbol) {
      const others = DEFAULT_SYMBOLS.filter(s => s !== initialSymbol);
      return [initialSymbol, ...others.slice(0, 6)].join(', ');
    }
    return DEFAULT_SYMBOLS.join(', ');
  });
  const [filterSymbol, setFilterSymbol] = useState<string>(() => initialSymbol || 'All');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Update when initialSymbol changes
  useEffect(() => {
    if (initialSymbol) {
      const others = DEFAULT_SYMBOLS.filter(s => s !== initialSymbol);
      const newSymbols = [initialSymbol, ...others.slice(0, 6)];
      setSymbols(newSymbols);
      setInputValue(newSymbols.join(', '));
      setFilterSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch news for all symbols
      const symbolList = symbols.join(',');
      const data = await fmp.stockNews(symbolList, 0, 100);

      // Sort by date descending
      data.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

      setNews(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">
            {news.length} articles
          </span>
        </div>
      );
      onSymbolChange('press', headerContent);
    }
  }, [news.length, onSymbolChange]);

  // Handle symbol input
  const handleUpdateSymbols = () => {
    const newSymbols = inputValue
      .toUpperCase()
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length <= 5);

    if (newSymbols.length > 0) {
      setSymbols(newSymbols);
      setFilterSymbol('All');
    }
  };

  // Get unique symbols from news
  const uniqueSymbols = ['All', ...new Set(news.map(n => n.symbol).filter(Boolean) as string[])];

  // Filter news
  const filteredNews = filterSymbol === 'All'
    ? news
    : news.filter(n => n.symbol === filterSymbol);

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border space-y-2">
        {/* Symbol Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateSymbols()}
            placeholder="Enter symbols (e.g., AAPL, MSFT, NVDA)"
            className="flex-1 px-2 py-1 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
          />
          <button
            onClick={handleUpdateSymbols}
            className="px-3 py-1 text-xs bg-accent-primary text-white rounded hover:bg-accent-primary/80"
          >
            Update
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Symbol Filter Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {uniqueSymbols.slice(0, 10).map(sym => (
            <button
              key={sym}
              onClick={() => setFilterSymbol(sym)}
              className={`px-2 py-0.5 text-xs rounded border ${
                filterSymbol === sym
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && news.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading news...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No news found</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNews.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                className="p-3 hover:bg-bg-secondary transition-colors"
              >
                <div className="flex gap-3">
                  {/* Image */}
                  {item.image && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-24 h-16 object-cover rounded bg-bg-tertiary"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </a>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      {item.symbol && (
                        <button
                          onClick={() => onOpenDescription?.(item.symbol!)}
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-bg-tertiary rounded hover:bg-bg-secondary"
                        >
                          <img
                            src={getLogoUrl(item.symbol)}
                            alt={item.symbol}
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="text-xs font-medium">{item.symbol}</span>
                        </button>
                      )}
                      <span className={`text-[10px] font-medium ${getSourceColor(item.publisher)}`}>
                        {item.publisher}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {formatRelativeTime(item.publishedDate)}
                      </span>
                    </div>

                    {/* Title */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium hover:text-accent-primary line-clamp-2"
                    >
                      {item.title}
                    </a>

                    {/* Preview Text */}
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <span>
          Watching: {symbols.join(', ')}
        </span>
        <span>
          {filteredNews.length} articles
          {lastUpdate && ` | Updated ${lastUpdate.toLocaleTimeString()}`}
        </span>
      </div>
    </div>
  );
}
