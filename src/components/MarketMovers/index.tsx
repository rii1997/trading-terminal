import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { MarketMover } from '../../types/fmp';

interface MarketMoversProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol.replace('.', '')}.png`;
};

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
};

type ViewMode = 'gainers' | 'losers' | 'active';

export function MarketMovers({ onSymbolChange, onOpenDescription }: MarketMoversProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [active, setActive] = useState<MarketMover[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('gainers');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [gainersData, losersData, activeData] = await Promise.all([
        fmp.biggestGainers(),
        fmp.biggestLosers(),
        fmp.mostActive(),
      ]);

      setGainers(gainersData.slice(0, 20));
      setLosers(losersData.slice(0, 20));
      setActive(activeData.slice(0, 20));
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market movers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : ''}
          </span>
        </div>
      );
      onSymbolChange('movers', headerContent);
    }
  }, [lastUpdate, onSymbolChange]);

  const getCurrentData = (): MarketMover[] => {
    switch (viewMode) {
      case 'gainers': return gainers;
      case 'losers': return losers;
      case 'active': return active;
    }
  };

  const data = getCurrentData();

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('gainers')}
            className={`px-3 py-1 text-xs font-medium rounded border ${
              viewMode === 'gainers'
                ? 'bg-accent-green text-white border-accent-green'
                : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setViewMode('losers')}
            className={`px-3 py-1 text-xs font-medium rounded border ${
              viewMode === 'losers'
                ? 'bg-accent-red text-white border-accent-red'
                : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
            }`}
          >
            Losers
          </button>
          <button
            onClick={() => setViewMode('active')}
            className={`px-3 py-1 text-xs font-medium rounded border ${
              viewMode === 'active'
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
            }`}
          >
            Most Active
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading market movers...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr className="text-left text-xs text-text-secondary">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Symbol</th>
                <th className="px-3 py-2 font-medium text-right">Price</th>
                <th className="px-3 py-2 font-medium text-right">Change</th>
                <th className="px-3 py-2 font-medium text-right">Change %</th>
                {viewMode === 'active' && (
                  <th className="px-3 py-2 font-medium text-right">Volume</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((stock, idx) => (
                <tr
                  key={stock.symbol}
                  onClick={() => onOpenDescription?.(stock.symbol)}
                  className="border-b border-border hover:bg-bg-secondary cursor-pointer"
                >
                  <td className="px-3 py-2 text-text-secondary">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-bg-tertiary flex items-center justify-center">
                        <img
                          src={getLogoUrl(stock.symbol)}
                          alt={stock.symbol}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-[10px] text-text-secondary truncate max-w-[150px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${
                    stock.change >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-medium ${
                    stock.changesPercentage >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {stock.changesPercentage >= 0 ? '+' : ''}{stock.changesPercentage.toFixed(2)}%
                  </td>
                  {viewMode === 'active' && (
                    <td className="px-3 py-2 text-right font-mono text-text-secondary">
                      {formatNumber((stock as any).volume || 0)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <span>
          {viewMode === 'gainers' && 'Top gaining stocks today'}
          {viewMode === 'losers' && 'Top losing stocks today'}
          {viewMode === 'active' && 'Most actively traded stocks today'}
        </span>
        <span>Showing top 20</span>
      </div>
    </div>
  );
}
