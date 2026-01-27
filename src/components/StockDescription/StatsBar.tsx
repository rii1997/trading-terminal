import type { Quote, AnalystEstimate } from '../../types/fmp';
import { formatCurrency, formatLargeNumber } from '../../utils/formatters';

interface StatsBarProps {
  quote: Quote | null;
  estimates: AnalystEstimate[];
  onOpenFinancials?: () => void;
  onOpenEarningsMatrix?: () => void;
  onOpenRatios?: () => void;
  onOpenInsiderTrades?: () => void;
  onOpenCongressTrades?: () => void;
  onOpenDividends?: () => void;
  onOpenPress?: () => void;
  onOpenAnalystRatings?: () => void;
  onOpenSECFilings?: () => void;
}

export function StatsBar({
  quote,
  estimates,
  onOpenFinancials,
  onOpenEarningsMatrix,
  onOpenRatios,
  onOpenInsiderTrades,
  onOpenCongressTrades,
  onOpenDividends,
  onOpenPress,
  onOpenAnalystRatings,
  onOpenSECFilings,
}: StatsBarProps) {
  // Get the first two estimates for Q1 and FY
  const quarterEstimate = estimates[0];
  const yearEstimate = estimates.find(e => e.date !== quarterEstimate?.date) || estimates[1];

  return (
    <div className="border-b border-border">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-tertiary border-b border-border">
        <span className="text-text-primary text-xs font-semibold">STATS</span>
        <button
          onClick={onOpenFinancials}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-blue border border-border rounded hover:bg-bg-tertiary"
          title="Financials"
        >
          FA
        </button>
        <button
          onClick={onOpenEarningsMatrix}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-orange border border-border rounded hover:bg-bg-tertiary"
          title="Earnings Matrix"
        >
          EM
        </button>
        <button
          onClick={onOpenAnalystRatings}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-green border border-border rounded hover:bg-bg-tertiary"
          title="Analyst Ratings"
        >
          ANR
        </button>
        <button
          onClick={onOpenRatios}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-cyan border border-border rounded hover:bg-bg-tertiary"
          title="Financial Ratios"
        >
          RTR
        </button>
        <button
          onClick={onOpenInsiderTrades}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-yellow border border-border rounded hover:bg-bg-tertiary"
          title="Insider Trades"
        >
          IN
        </button>
        <button
          onClick={onOpenCongressTrades}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-purple border border-border rounded hover:bg-bg-tertiary"
          title="Congress Trades"
        >
          CG
        </button>
        <button
          onClick={onOpenDividends}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-cyan border border-border rounded hover:bg-bg-tertiary"
          title="Dividends"
        >
          DIV
        </button>
        <button
          onClick={onOpenPress}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-text-secondary border border-border rounded hover:bg-bg-tertiary"
          title="Press Releases"
        >
          Press
        </button>
        <button
          onClick={onOpenSECFilings}
          className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-red border border-border rounded hover:bg-bg-tertiary"
          title="SEC Filings"
        >
          SEC
        </button>
      </div>

      {/* Content */}
      <div className="flex px-2 py-1 gap-4">
        {/* Left: Price Stats */}
        <div className="space-y-px text-xs">
          <div className="flex gap-4">
            <span className="text-text-primary w-16">Price</span>
            <span className="text-text-primary font-mono">{formatCurrency(quote?.price)}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-primary w-16">Shares</span>
            <span className="text-text-primary font-mono">{formatLargeNumber(quote?.sharesOutstanding)}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-primary w-16">Mkt Cap</span>
            <span className="text-text-primary font-mono">{formatLargeNumber(quote?.marketCap)}</span>
          </div>
        </div>

        {/* Right: EPS Estimates */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-text-primary text-xs font-semibold">EPS EST</span>
          </div>

          <table className="text-xs w-full max-w-xs">
            <thead>
              <tr className="text-text-primary">
                <th className="text-left font-normal pr-4"></th>
                <th className="text-right font-normal px-2">Q1</th>
                <th className="text-right font-normal px-2">FY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-text-primary pr-4">Date</td>
                <td className="text-text-primary text-right px-2 font-mono">
                  {quarterEstimate?.date ? new Date(quarterEstimate.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '-'}
                </td>
                <td className="text-text-primary text-right px-2 font-mono">
                  {yearEstimate?.date ? new Date(yearEstimate.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '-'}
                </td>
              </tr>
              <tr>
                <td className="text-text-primary pr-4">EPS</td>
                <td className="text-text-primary text-right px-2 font-mono">
                  {quarterEstimate?.epsAvg?.toFixed(2) || '-'}
                </td>
                <td className="text-text-primary text-right px-2 font-mono">
                  {yearEstimate?.epsAvg?.toFixed(2) || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
