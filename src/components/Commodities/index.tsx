import React from 'react';
import { useCommodities, type CommodityData } from '../../hooks/useCommodities';

// Format price with appropriate decimals
function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '--';
  if (price >= 1000) return price.toFixed(2);
  if (price >= 100) return price.toFixed(2);
  if (price >= 10) return price.toFixed(2);
  return price.toFixed(2);
}

// Format change value
function formatChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return '--';
  return change.toFixed(2);
}

// Format percentage with color class
function formatPct(pct: number | null | undefined): { text: string; className: string } {
  if (pct === null || pct === undefined) return { text: '--', className: 'text-text-secondary' };
  return {
    text: `${pct.toFixed(2)}%`,
    className: pct >= 0 ? 'text-accent-green' : 'text-accent-red',
  };
}

// Group commodities by category
function groupByCategory(commodities: CommodityData[]): Record<string, CommodityData[]> {
  return commodities.reduce((acc, commodity) => {
    if (!acc[commodity.category]) acc[commodity.category] = [];
    acc[commodity.category].push(commodity);
    return acc;
  }, {} as Record<string, CommodityData[]>);
}

export function Commodities() {
  const { data } = useCommodities();
  const grouped = groupByCategory(data);
  const categories = ['Grain', 'Softs', 'Metals', 'Meat', 'Energy'];

  const isLoading = data.some(d => d.loading);

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-bg-secondary z-10">
            <tr className="border-b border-border text-text-secondary">
              <th className="text-left font-normal px-2 py-1 w-20">Ticker</th>
              <th className="text-left font-normal px-2 py-1">Name</th>
              <th className="text-right font-normal px-2 py-1 w-20">Last</th>
              <th className="text-right font-normal px-2 py-1 w-16">Chg</th>
              <th className="text-right font-normal px-2 py-1 w-16">Chg %</th>
              <th className="text-right font-normal px-2 py-1 w-16">YTD %</th>
              <th className="text-right font-normal px-2 py-1 w-14">Delay</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => {
              const categoryData = grouped[category] || [];
              if (categoryData.length === 0) return null;

              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="border-b border-border/30">
                    <td
                      colSpan={7}
                      className="text-text-primary font-semibold px-2 py-1 bg-bg-tertiary/50 text-xs"
                    >
                      {category}
                    </td>
                  </tr>

                  {/* Commodity Rows */}
                  {categoryData.map(commodity => {
                    const changePct = formatPct(commodity.changePct);
                    const ytdPct = formatPct(commodity.ytdPct);
                    const isPremium = commodity.isPremium;

                    return (
                      <tr
                        key={commodity.symbol}
                        className={`border-b border-border/30 ${isPremium ? 'opacity-50' : 'hover:bg-bg-tertiary/30'}`}
                      >
                        <td className="px-2 py-0.5">
                          <span className={isPremium ? 'text-text-secondary' : 'text-text-primary'}>{commodity.displaySymbol}</span>
                          {isPremium && (
                            <span className="ml-1 text-[10px] bg-amber-900/50 text-amber-400 px-0.5 rounded">P</span>
                          )}
                        </td>
                        <td className={`px-2 py-0.5 ${isPremium ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {commodity.name}
                        </td>
                        <td className="text-right text-text-secondary px-2 py-0.5">
                          {commodity.loading ? (
                            <span>...</span>
                          ) : isPremium ? (
                            <span>N/A</span>
                          ) : (
                            <span className="text-text-primary">{formatPrice(commodity.price)}</span>
                          )}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : commodity.change !== null && commodity.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {commodity.loading ? '--' : isPremium ? 'N/A' : formatChange(commodity.change)}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : changePct.className}`}>
                          {commodity.loading ? '--' : isPremium ? 'N/A' : changePct.text}
                        </td>
                        <td className={`text-right px-2 py-0.5 ${isPremium ? 'text-text-secondary' : ytdPct.className}`}>
                          {commodity.loading ? '--' : isPremium ? 'N/A' : ytdPct.text}
                        </td>
                        <td className="text-right px-2 py-0.5 text-text-secondary">
                          {isPremium ? '--' : '0m'}
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
            <span className="bg-amber-900/50 text-amber-400 px-0.5 rounded">P</span>
            <span>Premium</span>
          </span>
          <span>{data.filter(d => !d.isPremium).length}/{data.length}</span>
        </span>
      </div>
    </div>
  );
}
