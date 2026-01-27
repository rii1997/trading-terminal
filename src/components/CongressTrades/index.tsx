import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { CongressTrade, Quote } from '../../types/fmp';

interface CongressTradesProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

// Parse amount range to get midpoint value
function parseAmountRange(amount: string): number {
  // Remove $ and commas, extract numbers
  const matches = amount.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return 0;

  const values = matches.map(m => parseInt(m.replace(/,/g, ''), 10));
  if (values.length === 1) return values[0];
  // Return midpoint
  return (values[0] + values[1]) / 2;
}

// Get amount display color based on size
function getAmountColor(amount: string): string {
  const value = parseAmountRange(amount);
  if (value >= 1000000) return 'text-accent-yellow';
  if (value >= 250000) return 'text-text-primary';
  return 'text-text-secondary';
}

export function CongressTrades({ onSymbolChange, initialSymbol }: CongressTradesProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [trades, setTrades] = useState<CongressTrade[]>([]);

  const { results: searchResults, loading: searchLoading } = useTickerSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

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
        const [quoteData, tradesData] = await Promise.all([
          fmp.quote(symbol),
          fmp.houseTrades(symbol, 100),
        ]);

        setQuote(quoteData[0] || null);
        setTrades(tradesData || []);
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

  // Calculate summary stats
  const calculateSummary = () => {
    let totalBuyValue = 0;
    let totalSellValue = 0;
    let buyCount = 0;
    let sellCount = 0;
    const uniqueMembers = new Set<string>();

    trades.forEach(t => {
      const value = parseAmountRange(t.amount);
      uniqueMembers.add(`${t.firstName} ${t.lastName}`);

      if (t.type.toLowerCase() === 'purchase') {
        totalBuyValue += value;
        buyCount++;
      } else if (t.type.toLowerCase() === 'sale') {
        totalSellValue += value;
        sellCount++;
      }
    });

    return {
      totalBuyValue,
      totalSellValue,
      buyCount,
      sellCount,
      memberCount: uniqueMembers.size,
    };
  };

  const summary = calculateSummary();

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

  // Get notable traders (high profile members)
  const notableTraders = ['Pelosi', 'Tuberville', 'McConnell', 'Crenshaw', 'Greene'];
  const isNotableTrader = (lastName: string): boolean => {
    return notableTraders.some(n => lastName.toLowerCase().includes(n.toLowerCase()));
  };

  // Group trades by member
  const tradesByMember = trades.reduce((acc, trade) => {
    const name = `${trade.firstName} ${trade.lastName}`;
    if (!acc[name]) {
      acc[name] = { trades: [], totalValue: 0 };
    }
    acc[name].trades.push(trade);
    acc[name].totalValue += parseAmountRange(trade.amount);
    return acc;
  }, {} as Record<string, { trades: CongressTrade[]; totalValue: number }>);

  // Sort members by total value
  const sortedMembers = Object.entries(tradesByMember)
    .sort((a, b) => b[1].totalValue - a[1].totalValue);

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
            <div className="text-text-secondary">No congressional trades found for {symbol}</div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Total Trades</div>
                <div className="text-lg font-medium">{trades.length}</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Members</div>
                <div className="text-lg font-medium">{summary.memberCount}</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Buys</div>
                <div className="text-sm font-medium text-accent-green">{summary.buyCount}</div>
                <div className="text-xs text-text-secondary">{formatCurrency(summary.totalBuyValue)}</div>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <div className="text-xs text-text-secondary">Sells</div>
                <div className="text-sm font-medium text-accent-red">{summary.sellCount}</div>
                <div className="text-xs text-text-secondary">{formatCurrency(summary.totalSellValue)}</div>
              </div>
            </div>

            {/* Activity Indicator */}
            <div className="bg-bg-secondary rounded p-2 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Congressional Activity</span>
                <span className={`text-sm font-medium ${
                  summary.totalBuyValue > summary.totalSellValue ? 'text-accent-green' :
                  summary.totalSellValue > summary.totalBuyValue ? 'text-accent-red' : 'text-text-secondary'
                }`}>
                  {summary.totalBuyValue > summary.totalSellValue ? 'NET BUYING' :
                   summary.totalSellValue > summary.totalBuyValue ? 'NET SELLING' : 'BALANCED'}
                </span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded overflow-hidden flex">
                {summary.totalBuyValue + summary.totalSellValue > 0 && (
                  <>
                    <div
                      className="h-full bg-accent-green"
                      style={{ width: `${(summary.totalBuyValue / (summary.totalBuyValue + summary.totalSellValue)) * 100}%` }}
                    />
                    <div
                      className="h-full bg-accent-red"
                      style={{ width: `${(summary.totalSellValue / (summary.totalBuyValue + summary.totalSellValue)) * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Top Traders */}
            {sortedMembers.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-text-secondary mb-1">Top Traders by Volume</div>
                <div className="flex flex-wrap gap-1">
                  {sortedMembers.slice(0, 6).map(([name, data]) => (
                    <div
                      key={name}
                      className={`bg-bg-secondary rounded px-2 py-1 text-xs ${
                        isNotableTrader(name.split(' ')[1] || '') ? 'border border-accent-yellow' : ''
                      }`}
                    >
                      <span className="font-medium">{name.split(' ')[1]}</span>
                      <span className="text-text-secondary ml-1">({data.trades.length})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trades Table */}
            <div className="text-xs text-text-secondary mb-1">All Transactions</div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left py-1.5 px-2 border-b border-border">Disclosed</th>
                    <th className="text-left py-1.5 px-2 border-b border-border">Trade Date</th>
                    <th className="text-left py-1.5 px-2 border-b border-border">Member</th>
                    <th className="text-left py-1.5 px-2 border-b border-border">District</th>
                    <th className="text-center py-1.5 px-2 border-b border-border">Type</th>
                    <th className="text-center py-1.5 px-2 border-b border-border">Asset</th>
                    <th className="text-right py-1.5 px-2 border-b border-border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, idx) => {
                    const isBuy = trade.type.toLowerCase() === 'purchase';
                    const isNotable = isNotableTrader(trade.lastName);
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-border last:border-b-0 hover:bg-bg-secondary/50 ${
                          isNotable ? 'bg-accent-yellow/5' : ''
                        }`}
                      >
                        <td className="py-1.5 px-2 text-text-secondary">
                          {formatDate(trade.disclosureDate)}
                        </td>
                        <td className="py-1.5 px-2 text-text-secondary">
                          {formatDate(trade.transactionDate)}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1">
                            <span className={isNotable ? 'text-accent-yellow font-medium' : ''}>
                              {trade.firstName} {trade.lastName}
                            </span>
                            {trade.owner && (
                              <span className="text-text-secondary text-[10px]">
                                ({trade.owner})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-text-secondary">
                          {trade.district || '--'}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            isBuy ? 'text-accent-green bg-accent-green/10' : 'text-accent-red bg-accent-red/10'
                          }`}>
                            {isBuy ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center text-text-secondary">
                          {trade.assetType === 'Stock Option' ? 'Option' : 'Stock'}
                        </td>
                        <td className={`py-1.5 px-2 text-right font-mono ${getAmountColor(trade.amount)}`}>
                          {trade.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Disclosure Link */}
            {trades.length > 0 && trades[0].link && (
              <div className="mt-2 text-xs text-text-secondary text-center">
                <a
                  href={trades[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline"
                >
                  View Latest Disclosure PDF
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
