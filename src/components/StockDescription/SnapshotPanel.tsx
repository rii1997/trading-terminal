import type { CompanyProfile, KeyMetrics, Ratios, RatiosTTM, SharesFloat, Dividend } from '../../types/fmp';
import { formatLargeNumber, formatRatio, formatPercent } from '../../utils/formatters';

interface SnapshotPanelProps {
  profile: CompanyProfile | null;
  metrics: KeyMetrics | null;
  ratios: Ratios | null;
  ratiosTTM: RatiosTTM | null;
  sharesFloat: SharesFloat | null;
  latestDividend: Dividend | null;
}

interface StatRowProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  const displayValue = value === null || value === undefined || value === '' ? '-' : value;
  return (
    <div className="flex justify-between py-px">
      <span className={highlight ? 'text-accent-blue' : 'text-text-primary'}>{label}</span>
      <span className="text-text-primary font-mono">{displayValue}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-text-primary text-[10px] font-semibold mt-2 mb-0.5 border-b border-border pb-0.5">
      {title}
    </div>
  );
}

export function SnapshotPanel({ profile, metrics, ratios, ratiosTTM, sharesFloat, latestDividend }: SnapshotPanelProps) {
  // Format date for display
  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return (
    <div className="w-44 bg-bg-secondary border-l border-border p-1.5 text-[10px] overflow-y-auto">
      <div className="font-semibold text-text-primary mb-1 text-xs">SNAPSHOT</div>

      {/* Market Info */}
      <SectionHeader title="Market Info" />
      <StatRow label="Exchange" value={profile?.exchange} />
      <StatRow label="Currency" value={profile?.currency} />
      <StatRow label="Float" value={sharesFloat?.floatShares ? formatLargeNumber(sharesFloat.floatShares) : '-'} />

      {/* Company Stats */}
      <SectionHeader title="Company Stats" />
      <StatRow label="Employees" value={profile?.fullTimeEmployees} highlight />
      <StatRow label="Insiders" value="-" highlight />
      <StatRow label="Institutions" value="-" highlight />

      {/* Valuation Ratios */}
      <SectionHeader title="Valuation Ratios" />
      <StatRow label="P/Sales" value={ratios?.priceToSalesRatio ? formatRatio(ratios.priceToSalesRatio) : '-'} highlight />
      <StatRow label="P/Book" value={ratios?.priceToBookRatio ? formatRatio(ratios.priceToBookRatio) : '-'} highlight />
      <StatRow label="EV/EBITDA" value={ratios?.enterpriseValueMultiple ? formatRatio(ratios.enterpriseValueMultiple) : '-'} highlight />
      <StatRow label="EV/R" value={metrics?.evToSales ? formatRatio(metrics.evToSales) : '-'} highlight />
      <StatRow label="EV" value={metrics?.enterpriseValue ? formatLargeNumber(metrics.enterpriseValue) : '-'} highlight />
      <StatRow label="Trl P/E" value={ratios?.priceToEarningsRatio ? formatRatio(ratios.priceToEarningsRatio) + 'x' : '-'} highlight />
      <StatRow label="Fwd P/E" value="-" highlight />

      {/* Dividend & Yield */}
      <SectionHeader title="Dividend & Yield" />
      <StatRow label="Trl Yld" value={ratiosTTM?.dividendYieldTTM ? formatPercent(ratiosTTM.dividendYieldTTM * 100) : '-'} highlight />
      <StatRow label="Fwd Yld" value="-" highlight />
      <StatRow label="5Y Avg Yld" value="-" highlight />
      <StatRow label="Payout R" value={ratiosTTM?.dividendPayoutRatioTTM ? formatPercent(ratiosTTM.dividendPayoutRatioTTM * 100) : '-'} highlight />
      <StatRow label="Ex Div Date" value={formatDate(latestDividend?.date)} highlight />
      <StatRow label="Div Date" value={formatDate(latestDividend?.paymentDate)} highlight />

      {/* Risk & Sentiment */}
      <SectionHeader title="Risk & Sentiment" />
      <StatRow label="Beta" value={profile?.beta ? formatRatio(profile.beta) : '-'} />
      <StatRow label="Short" value="-" />
      <StatRow label="Short R" value="-" />
    </div>
  );
}
