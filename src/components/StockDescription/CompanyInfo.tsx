import type { DCFValue, KeyExecutive, EmployeeCount, StockPeer } from '../../types/fmp';
import { formatLargeNumber, formatCurrency } from '../../utils/formatters';

interface CompanyInfoProps {
  dcf: DCFValue | null;
  peers: StockPeer[];
  executives: KeyExecutive[];
  employeeHistory: EmployeeCount[];
  currentPrice?: number;
  onPeerClick?: (symbol: string) => void;
  loading?: boolean;
}

export function CompanyInfo({
  dcf,
  peers,
  executives,
  employeeHistory,
  currentPrice,
  onPeerClick,
  loading,
}: CompanyInfoProps) {
  if (loading) {
    return (
      <div className="px-3 py-2 text-text-secondary text-xs">Loading company info...</div>
    );
  }

  // Calculate fair value premium/discount
  const getFairValueStatus = () => {
    if (!dcf || !currentPrice) return null;
    const diff = ((currentPrice - dcf.dcf) / dcf.dcf) * 100;
    if (diff > 10) return { label: 'Overvalued', color: 'text-accent-red', diff };
    if (diff < -10) return { label: 'Undervalued', color: 'text-accent-green', diff };
    return { label: 'Fair Value', color: 'text-accent-yellow', diff };
  };

  const fairValueStatus = getFairValueStatus();

  // Format pay
  const formatPay = (pay: number | null): string => {
    if (!pay) return '-';
    if (pay >= 1_000_000) return `$${(pay / 1_000_000).toFixed(1)}M`;
    if (pay >= 1_000) return `$${(pay / 1_000).toFixed(0)}K`;
    return `$${pay.toLocaleString()}`;
  };

  // Calculate employee growth
  const getEmployeeGrowth = () => {
    if (employeeHistory.length < 2) return null;
    const latest = employeeHistory[0].employeeCount;
    const previous = employeeHistory[1].employeeCount;
    const growth = ((latest - previous) / previous) * 100;
    return growth;
  };

  const employeeGrowth = getEmployeeGrowth();

  return (
    <div className="border-t border-border">
      {/* DCF Fair Value */}
      {dcf && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[10px] font-semibold text-text-secondary mb-1">DCF FAIR VALUE</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary">
                {formatCurrency(dcf.dcf)}
              </span>
              {fairValueStatus && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${fairValueStatus.color} bg-opacity-20`}
                  style={{ backgroundColor: fairValueStatus.color === 'text-accent-green' ? 'rgba(34, 197, 94, 0.1)' : fairValueStatus.color === 'text-accent-red' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)' }}>
                  {fairValueStatus.label} ({fairValueStatus.diff > 0 ? '+' : ''}{fairValueStatus.diff.toFixed(1)}%)
                </span>
              )}
            </div>
            <div className="text-xs text-text-secondary">
              Current: {formatCurrency(currentPrice || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Stock Peers */}
      {peers.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[10px] font-semibold text-text-secondary mb-1">SIMILAR COMPANIES</div>
          <div className="flex flex-wrap gap-1">
            {peers.slice(0, 8).map((peer) => (
              <button
                key={peer.symbol}
                onClick={() => onPeerClick?.(peer.symbol)}
                className="px-2 py-0.5 text-xs bg-bg-tertiary hover:bg-accent-primary hover:text-white rounded transition-colors"
                title={peer.companyName}
              >
                {peer.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Executives */}
      {executives.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[10px] font-semibold text-text-secondary mb-1">KEY EXECUTIVES</div>
          <div className="space-y-1">
            {executives.slice(0, 5).map((exec, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex-1 min-w-0">
                  <span className="text-text-primary font-medium">{exec.name}</span>
                  <span className="text-text-secondary ml-1 truncate">
                    - {exec.title.replace(/^Senior Vice President of /, 'SVP ')}
                  </span>
                </div>
                {exec.pay && (
                  <span className="text-text-secondary ml-2 font-mono">
                    {formatPay(exec.pay)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Count */}
      {employeeHistory.length > 0 && (
        <div className="px-3 py-2">
          <div className="text-[10px] font-semibold text-text-secondary mb-1">EMPLOYEE COUNT</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary">
                {formatLargeNumber(employeeHistory[0].employeeCount)}
              </span>
              {employeeGrowth !== null && (
                <span className={`text-xs ${employeeGrowth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {employeeGrowth >= 0 ? '+' : ''}{employeeGrowth.toFixed(1)}% YoY
                </span>
              )}
            </div>
            {/* Mini trend */}
            <div className="flex items-end gap-0.5 h-4">
              {employeeHistory.slice(0, 5).reverse().map((emp, idx) => {
                const maxCount = Math.max(...employeeHistory.map(e => e.employeeCount));
                const height = (emp.employeeCount / maxCount) * 100;
                return (
                  <div
                    key={idx}
                    className="w-3 bg-accent-blue rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${emp.periodOfReport.split('-')[0]}: ${emp.employeeCount.toLocaleString()}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
