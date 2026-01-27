import { useState, useEffect } from 'react';
import { InlineTickerInput } from '../StockDescription/InlineTickerInput';
import { useStockNews } from '../../hooks/useStockNews';

interface NewsProps {
  onSymbolChange?: (symbol: string, headerContent: React.ReactNode) => void;
  initialSymbol?: string;
}

// Format date and time from FMP date string
function formatDateTime(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return { date, time };
}

export function News({ onSymbolChange, initialSymbol }: NewsProps) {
  const [symbol, setSymbol] = useState<string>(initialSymbol || '');
  const [isPaused, setIsPaused] = useState(false);

  // Fetch news - if symbol is set, fetch for that symbol, otherwise fetch latest
  const { data: articles, loading } = useStockNews(symbol || undefined, 200);

  const handleTickerSelect = (newSymbol: string) => {
    setSymbol(newSymbol);
  };

  const clearFilter = () => {
    setSymbol('');
  };

  // Update symbol when initialSymbol changes from parent
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Notify parent of symbol changes for header content
  useEffect(() => {
    if (onSymbolChange) {
      onSymbolChange(
        symbol || 'ALL',
        <InlineTickerInput
          value={symbol}
          onSelect={handleTickerSelect}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border">
        <span className="text-text-secondary text-xs">/ search</span>

        <select className="bg-bg-tertiary border border-border text-text-primary text-xs px-1.5 py-0.5 rounded">
          <option>No Watchlist</option>
        </select>

        <select className="bg-bg-tertiary border border-border text-text-primary text-xs px-1.5 py-0.5 rounded">
          <option>All</option>
        </select>

        <button
          onClick={clearFilter}
          className="text-text-primary text-xs px-2 py-0.5 border border-border rounded hover:bg-bg-tertiary"
        >
          Clear
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`text-xs px-2 py-0.5 border border-border rounded ${
            isPaused ? 'bg-accent-yellow text-black' : 'text-text-primary hover:bg-bg-tertiary'
          }`}
        >
          {isPaused ? '||' : '||'}
        </button>

        <span className="ml-auto text-text-secondary text-xs">
          {articles.length} results
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-bg-secondary z-10">
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left font-normal px-2 py-1">Headline</th>
                <th className="text-left font-normal px-2 py-1 w-20">Date</th>
                <th className="text-left font-normal px-2 py-1 w-20">Time</th>
                <th className="text-left font-normal px-2 py-1 w-16">Ticker</th>
                <th className="text-left font-normal px-2 py-1 w-36">Source</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, idx) => {
                const { date, time } = formatDateTime(article.publishedDate);
                const ticker = article.symbol || '--';

                return (
                  <tr
                    key={idx}
                    className="border-b border-border/30 hover:bg-bg-tertiary/50 cursor-pointer"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <td className="text-text-primary px-2 py-0.5 truncate max-w-[500px]" title={article.title}>
                      {article.title}
                    </td>
                    <td className="text-text-secondary px-2 py-0.5">{date}</td>
                    <td className="text-text-secondary px-2 py-0.5">{time}</td>
                    <td className="text-text-primary px-2 py-0.5">
                      <span
                        className={ticker !== '--' ? 'text-accent-blue cursor-pointer hover:underline' : ''}
                        onClick={(e) => {
                          if (ticker !== '--') {
                            e.stopPropagation();
                            setSymbol(ticker);
                          }
                        }}
                      >
                        {ticker}
                      </span>
                    </td>
                    <td className="text-text-secondary px-2 py-0.5 truncate max-w-[150px]" title={article.publisher}>
                      {article.publisher}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-0.5 border-t border-border text-[10px] text-text-secondary">
        <span>Info</span>
        <span>{articles.length} results</span>
      </div>
    </div>
  );
}
