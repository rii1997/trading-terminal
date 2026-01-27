import React from 'react';
import { useWorldIndices, type WorldIndexData } from '../../hooks/useWorldIndices';

// Format price with appropriate decimals
function formatPrice(price: number | null): string {
  if (price === null) return '--';
  if (price >= 10000) return price.toFixed(2);
  if (price >= 1000) return price.toFixed(2);
  return price.toFixed(2);
}

// Format change value
function formatChange(change: number | null): string {
  if (change === null) return '--';
  const sign = change >= 0 ? '' : '';
  return `${sign}${change.toFixed(2)}`;
}

// Format percentage with color class
function formatPct(pct: number | null): { text: string; className: string } {
  if (pct === null) return { text: '--', className: 'text-text-secondary' };
  const sign = pct >= 0 ? '' : '';
  return {
    text: `${sign}${pct.toFixed(2)}%`,
    className: pct >= 0 ? 'text-accent-green' : 'text-accent-red',
  };
}

// Group indices by region
function groupByRegion(indices: WorldIndexData[]): Record<string, WorldIndexData[]> {
  return indices.reduce((acc, idx) => {
    if (!acc[idx.region]) acc[idx.region] = [];
    acc[idx.region].push(idx);
    return acc;
  }, {} as Record<string, WorldIndexData[]>);
}

export function WorldEquityIndex() {
  const { data } = useWorldIndices();
  const grouped = groupByRegion(data);
  const regions = ['Americas', 'EMEA', 'Asia/Pacific', 'Volatility'];

  const isLoading = data.some(d => d.loading);

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-bg-secondary z-10">
            <tr className="border-b border-border text-text-secondary">
              <th className="text-left font-normal px-2 py-1 w-24">Ticker</th>
              <th className="text-left font-normal px-2 py-1">Name</th>
              <th className="text-right font-normal px-2 py-1 w-24">Last</th>
              <th className="text-right font-normal px-2 py-1 w-20">Chg</th>
              <th className="text-right font-normal px-2 py-1 w-18">24h %</th>
              <th className="text-right font-normal px-2 py-1 w-18">1W %</th>
              <th className="text-right font-normal px-2 py-1 w-18">1M %</th>
            </tr>
          </thead>
          <tbody>
            {regions.map(region => {
              const regionData = grouped[region] || [];
              if (regionData.length === 0) return null;

              return (
                <React.Fragment key={region}>
                  {/* Region Header */}
                  <tr className="border-b border-border/30">
                    <td
                      colSpan={7}
                      className="text-text-primary font-semibold px-2 py-1 bg-bg-tertiary/50 text-xs"
                    >
                      {region}
                    </td>
                  </tr>

                  {/* Index Rows */}
                  {regionData.map(idx => {
                    const pct24h = formatPct(idx.changePct24h);
                    const pct1W = formatPct(idx.changePct1W);
                    const pct1M = formatPct(idx.changePct1M);
                    const isPremium = idx.isPremium;

                    return (
                      <tr
                        key={idx.symbol}
                        className={`border-b border-border/30 ${isPremium ? 'opacity-50' : 'hover:bg-bg-tertiary/30'}`}
                      >
                        <td className="px-2 py-0.5">
                          <span className={isPremium ? 'text-text-secondary' : 'text-text-primary'}>{idx.displaySymbol}</span>
                          {isPremium ? (
                            <span className="ml-1 text-[10px] bg-amber-900/50 text-amber-400 px-0.5 rounded">P</span>
                          ) : (
                            <span className="ml-1 text-[10px] bg-bg-tertiary text-text-secondary px-0.5 rounded">D</span>
                          )}
                        </td>
                        <td className={`px-2 py-0.5 ${isPremium ? 'text-text-secondary' : 'text-text-primary'}`}>{idx.name}</td>
                        <td className="text-right text-text-secondary px-2 py-0.5">
                          {idx.loading ? (
                            <span>...</span>
                          ) : isPremium ? (
                            <span>N/A</span>
                          ) : (
                            <span className="text-text-primary">{formatPrice(idx.price)}</span>
                          )}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : idx.change24h !== null && idx.change24h >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {idx.loading ? '--' : isPremium ? 'N/A' : formatChange(idx.change24h)}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : pct24h.className}`}>
                          {idx.loading ? '--' : isPremium ? 'N/A' : pct24h.text}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : pct1W.className}`}>
                          {idx.loading ? '--' : isPremium ? 'N/A' : pct1W.text}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : pct1M.className}`}>
                          {idx.loading ? '--' : isPremium ? 'N/A' : pct1M.text}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-0.5 border-t border-border text-[10px] text-text-secondary">
        <span>{isLoading ? 'Loading...' : 'Live'}</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <span className="bg-bg-tertiary text-text-secondary px-0.5 rounded">D</span>
            <span>Live</span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="bg-amber-900/50 text-amber-400 px-0.5 rounded">P</span>
            <span>Premium</span>
          </span>
          <span>{data.filter(d => !d.isPremium).length}/{data.length}</span>
        </span>
      </div>
    </div>
  );
}
