import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { InsiderTrade, InsiderTradeStats, Quote } from '../../types/fmp';

interface InsiderTradesProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

export function InsiderTrades({ onSymbolChange, initialSymbol }: InsiderTradesProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [stats, setStats] = useState<InsiderTradeStats[]>([]);

  const { results: searchResults, loading: searchLoading } = useTickerSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update symbol when initialSymbol prop changes
  useEffect(() => {
    if (initialSymbol && initialSymbol !== symbol) {
      setSymbol(initialSymbol);
      setQuery(initialSymbol);
    }
  }, [initialSymbol]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data when symbol changes
  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [quoteData, tradesData, statsData] = await Promise.all([
          fmp.quote(symbol),
          fmp.insiderTrades(symbol, 100),
          fmp.insiderTradeStats(symbol),
        ]);

        setQuote(quoteData[0] || null);
        setTrades(tradesData || []);
        setStats(statsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Update header when quote changes
  useEffect(() => {
    if (quote && onSymbolChange) {
      const changePct = quote.changesPercentage ?? 0;
      const price = quote.price ?? 0;
      const changeColor = changePct >= 0 ? 'text-accent-green' : 'text-accent-red';
      const changeSign = changePct >= 0 ? '+' : '';

      const headerContent = (
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-text-primary">{symbol}</span>
          <span className="text-text-primary">${price.toFixed(2)}</span>
          <span className={changeColor}>
            {changeSign}{changePct.toFixed(2)}%
          </span>
        </div>
      );

      onSymbolChange(symbol, headerContent);
    }
  }, [quote, symbol, onSymbolChange]);

  const handleSelectSymbol = useCallback((selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setQuery(selectedSymbol);
    setIsDropdownOpen(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setQuery(value);
    setIsDropdownOpen(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSymbol(query);
      setIsDropdownOpen(false);
    }
  }, [query]);

  // Calculate summary stats from trades
  const calculateSummary = () => {
    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);

    const recentTrades = trades.filter(t => new Date(t.transactionDate) >= last90Days);

    let totalBuys = 0;
    let totalSells = 0;
    let buyValue = 0;
    let sellValue = 0;
    let buyCount = 0;
    let sellCount = 0;

    recentTrades.forEach(t => {
      const value = t.securitiesTransacted * t.price;
      if (t.transactionType.includes('P') || t.acquisitionOrDisposition === 'A') {
        totalBuys += t.securitiesTransacted;
        buyValue += value;
        buyCount++;
      } else if (t.transactionType.includes('S') || t.acquisitionOrDisposition === 'D') {
        totalSells += t.securitiesTransacted;
        sellValue += value;
        sellCount++;
      }
    });

    return { totalBuys, totalSells, buyValue, sellValue, buyCount, sellCount };
  };

  const summary = calculateSummary();

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (num: number): string => {
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
    return '$' + num.toLocaleString();
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  // Get transaction type display
  const getTransactionType = (trade: InsiderTrade): { label: string; color: string } => {
    if (trade.transactionType.includes('P') || trade.acquisitionOrDisposition === 'A') {
      return { label: 'BUY', color: 'text-accent-green bg-accent-green/10' };
    } else if (trade.transactionType.includes('S') || trade.acquisitionOrDisposition === 'D') {
      return { label: 'SELL', color: 'text-accent-red bg-accent-red/10' };
    }
    return { label: trade.transactionType || 'OTHER', color: 'text-text-secondary bg-bg-tertiary' };
  };

  // Get owner type short label
  const getOwnerLabel = (typeOfOwner: string): string => {
    if (typeOfOwner.toLowerCase().includes('ceo')) return 'CEO';
    if (typeOfOwner.toLowerCase().includes('cfo')) return 'CFO';
    if (typeOfOwner.toLowerCase().includes('coo')) return 'COO';
    if (typeOfOwner.toLowerCase().includes('director')) return 'Director';
    if (typeOfOwner.toLowerCase().includes('officer')) return 'Officer';
    if (typeOfOwner.toLowerCase().includes('10%')) return '10% Owner';
    return typeOfOwner.split(':')[0] || 'Insider';
  };

  // Calculate monthly net activity for chart
  const calculateMonthlyActivity = () => {
    const monthlyData: { month: string; buyValue: number; sellValue: number; net: number }[] = [];
    const monthMap = new Map<string, { buyValue: number; sellValue: number }>();

    // Get last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { buyValue: 0, sellValue: 0 });
    }

    // Aggregate trades by month
    trades.forEach(t => {
      const date = new Date(t.transactionDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthMap.has(key)) {
        const value = t.securitiesTransacted * t.price;
        const entry = monthMap.get(key)!;

        if (t.transactionType.includes('P') || t.acquisitionOrDisposition === 'A') {
          entry.buyValue += value;
        } else if (t.transactionType.includes('S') || t.acquisitionOrDisposition === 'D') {
          entry.sellValue += value;
        }
      }
    });

    // Convert to array
    monthMap.forEach((data, key) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyData.push({
        month: `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`,
        buyValue: data.buyValue,
        sellValue: data.sellValue,
        net: data.buyValue - data.sellValue,
      });
    });

    return monthlyData;
  };

  const monthlyActivity = calculateMonthlyActivity();

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Search Bar */}
      <div className="flex-shrink-0 p-2 border-b border-border">
        <div ref={containerRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search symbol..."
            className="w-full bg-bg-secondary border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent-primary"
          />
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
              {searchLoading ? (
                <div className="px-3 py-2 text-text-secondary text-sm">Searching...</div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelectSymbol(result.symbol)}
                    className="w-full px-3 py-2 text-left hover:bg-bg-tertiary flex justify-between items-center"
                  >
                    <span className="font-medium text-sm">{result.symbol}</span>
                    <span className="text-text-secondary text-xs truncate ml-2">{result.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No insider trades found for {symbol}</div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">90D Buys</div>
                <div className="text-sm font-medium text-accent-green">{summary.buyCount}</div>
                <div className="text-xs text-text-secondary">{formatNumber(summary.totalBuys)} shares</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">90D Sells</div>
                <div className="text-sm font-medium text-accent-red">{summary.sellCount}</div>
                <div className="text-xs text-text-secondary">{formatNumber(summary.totalSells)} shares</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Buy Value</div>
                <div className="text-sm font-medium text-accent-green">{formatCurrency(summary.buyValue)}</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Sell Value</div>
                <div className="text-sm font-medium text-accent-red">{formatCurrency(summary.sellValue)}</div>
              </div>
            </div>

            {/* Net Activity Indicator */}
            <div className="bg-bg-secondary rounded p-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">90D Net Activity</span>
                <span className={`text-sm font-medium ${
                  summary.buyValue > summary.sellValue ? 'text-accent-green' :
                  summary.sellValue > summary.buyValue ? 'text-accent-red' : 'text-text-secondary'
                }`}>
                  {summary.buyValue > summary.sellValue ? 'NET BUYING' :
                   summary.sellValue > summary.buyValue ? 'NET SELLING' : 'NEUTRAL'}
                </span>
              </div>
              {/* Visual bar */}
              <div className="mt-2 h-2 bg-bg-tertiary rounded overflow-hidden flex">
                {summary.buyValue + summary.sellValue > 0 && (
                  <>
                    <div
                      className="h-full bg-accent-green"
                      style={{ width: `${(summary.buyValue / (summary.buyValue + summary.sellValue)) * 100}%` }}
                    />
                    <div
                      className="h-full bg-accent-red"
                      style={{ width: `${(summary.sellValue / (summary.buyValue + summary.sellValue)) * 100}%` }}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-1 text-xs text-text-secondary">
                <span>Buys: {formatCurrency(summary.buyValue)}</span>
                <span>Sells: {formatCurrency(summary.sellValue)}</span>
              </div>
            </div>

            {/* Monthly Activity Bar Chart */}
            {monthlyActivity.some(m => m.net !== 0) && (
              <div className="bg-bg-secondary rounded p-2 mb-3">
                <div className="text-xs text-text-secondary mb-2">Monthly Net Activity (12 Months)</div>
                <div className="h-24">
                  <svg width="100%" height="100%" viewBox="0 0 400 96" preserveAspectRatio="none">
                    {(() => {
                      const maxAbs = Math.max(...monthlyActivity.map(m => Math.abs(m.net)), 1);
                      const barWidth = 400 / monthlyActivity.length - 4;
                      const midY = 48;

                      return (
                        <>
                          {/* Zero line */}
                          <line x1="0" y1={midY} x2="400" y2={midY} stroke="#3a3f4b" strokeWidth="1" />

                          {/* Bars */}
                          {monthlyActivity.map((m, i) => {
                            const x = i * (400 / monthlyActivity.length) + 2;
                            const barHeight = (Math.abs(m.net) / maxAbs) * 40;
                            const y = m.net >= 0 ? midY - barHeight : midY;
                            const color = m.net >= 0 ? '#22c55e' : '#ef4444';

                            return (
                              <g key={i}>
                                {barHeight > 0 && (
                                  <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={color}
                                    opacity="0.8"
                                  />
                                )}
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                {/* Month labels */}
                <div className="flex justify-between mt-1 text-[9px] text-text-secondary">
                  {monthlyActivity.filter((_, i) => i % 3 === 0).map((m, i) => (
                    <span key={i}>{m.month}</span>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-1 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-accent-green rounded-sm"></span>
                    <span className="text-text-secondary">Net Buy</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-accent-red rounded-sm"></span>
                    <span className="text-text-secondary">Net Sell</span>
                  </span>
                </div>
              </div>
            )}

            {/* Quarterly Stats (if available) */}
            {stats.length > 0 && stats.some(s => s.buySellRatio != null) && (
              <div className="mb-3">
                <div className="text-xs text-text-secondary mb-1">Quarterly Statistics</div>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {stats.filter(s => s.buySellRatio != null).slice(0, 4).map((s, i) => (
                    <div key={i} className="bg-bg-secondary rounded p-1.5 text-center">
                      <div className="text-text-secondary">Q{s.quarter} {s.year}</div>
                      <div className={(s.buySellRatio ?? 0) >= 1 ? 'text-accent-green' : 'text-accent-red'}>
                        {(s.buySellRatio ?? 0).toFixed(2)}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trades Table */}
            <div className="text-xs text-text-secondary mb-1">Recent Transactions</div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left py-1.5 px-2 border-b border-border">Date</th>
                    <th className="text-left py-1.5 px-2 border-b border-border">Insider</th>
                    <th className="text-left py-1.5 px-2 border-b border-border">Role</th>
                    <th className="text-center py-1.5 px-2 border-b border-border">Type</th>
                    <th className="text-right py-1.5 px-2 border-b border-border">Shares</th>
                    <th className="text-right py-1.5 px-2 border-b border-border">Price</th>
                    <th className="text-right py-1.5 px-2 border-b border-border">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 50).map((trade, idx) => {
                    const txType = getTransactionType(trade);
                    const value = trade.securitiesTransacted * trade.price;
                    return (
                      <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-bg-secondary/50">
                        <td className="py-1.5 px-2 text-text-secondary">
                          {formatDate(trade.transactionDate)}
                        </td>
                        <td className="py-1.5 px-2 truncate max-w-[120px]" title={trade.reportingName}>
                          {trade.reportingName.split(' ').slice(0, 2).join(' ')}
                        </td>
                        <td className="py-1.5 px-2 text-text-secondary">
                          {getOwnerLabel(trade.typeOfOwner)}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${txType.color}`}>
                            {txType.label}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {formatNumber(trade.securitiesTransacted)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {trade.price > 0 ? `$${trade.price.toFixed(2)}` : '--'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono">
                          {value > 0 ? formatCurrency(value) : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
