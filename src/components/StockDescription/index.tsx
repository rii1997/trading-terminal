import { useState, useEffect } from 'react';
import { InlineTickerInput } from './InlineTickerInput';
import { PriceBar } from './PriceBar';
import { CompanyHeader } from './CompanyHeader';
import { SnapshotPanel } from './SnapshotPanel';
import { PriceChart } from './PriceChart';
import { StatsBar } from './StatsBar';
import { AnalystRatings } from './AnalystRatings';
import { CompanyInfo } from './CompanyInfo';
import { DebugPanel } from './DebugPanel';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';
import { useQuote } from '../../hooks/useQuote';
import { useKeyMetrics } from '../../hooks/useKeyMetrics';
import { useRatios } from '../../hooks/useRatios';
import { useRatiosTTM } from '../../hooks/useRatiosTTM';
import { useSharesFloat } from '../../hooks/useSharesFloat';
import { useDividends } from '../../hooks/useDividends';
import { useAnalystGrades } from '../../hooks/useAnalystGrades';
import { useAnalystEstimates } from '../../hooks/useAnalystEstimates';
import { useHistoricalPrice } from '../../hooks/useHistoricalPrice';
import { useDCF } from '../../hooks/useDCF';
import { useStockPeers } from '../../hooks/useStockPeers';
import { useKeyExecutives } from '../../hooks/useKeyExecutives';
import { useEmployeeCount } from '../../hooks/useEmployeeCount';

interface StockDescriptionProps {
  onSymbolChange?: (symbol: string, headerContent: React.ReactNode) => void;
  onOpenFinancials?: (symbol: string) => void;
  onOpenNews?: (symbol: string) => void;
  onOpenInsiderTrades?: (symbol: string) => void;
  onOpenEarningsMatrix?: (symbol: string) => void;
  onOpenRatios?: (symbol: string) => void;
  onOpenCongressTrades?: (symbol: string) => void;
  onOpenDividends?: (symbol: string) => void;
  onOpenPress?: (symbol: string) => void;
  onOpenAnalystRatings?: (symbol: string) => void;
  onOpenSECFilings?: (symbol: string) => void;
  initialSymbol?: string;
}

export function StockDescription({
  onSymbolChange,
  onOpenFinancials,
  onOpenNews: _onOpenNews,
  onOpenInsiderTrades,
  onOpenEarningsMatrix,
  onOpenRatios,
  onOpenCongressTrades,
  onOpenDividends,
  onOpenPress,
  onOpenAnalystRatings,
  onOpenSECFilings,
  initialSymbol,
}: StockDescriptionProps) {
  void _onOpenNews; // Reserved for future use
  const [symbol, setSymbol] = useState<string>(initialSymbol || 'TSLA');

  // Update symbol when initialSymbol prop changes
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch all data
  const { data: profile, loading: profileLoading } = useCompanyProfile(symbol);
  const { data: quote, loading: quoteLoading } = useQuote(symbol);
  const { data: metrics } = useKeyMetrics(symbol);
  const { data: ratios } = useRatios(symbol);
  const { data: ratiosTTM } = useRatiosTTM(symbol);
  const { data: sharesFloat } = useSharesFloat(symbol);
  const { data: dividends } = useDividends(symbol, 1);
  const { data: grades, loading: gradesLoading } = useAnalystGrades(symbol, 10);
  const { data: estimates } = useAnalystEstimates(symbol, 'quarter', 4);
  const { data: historicalData, loading: chartLoading } = useHistoricalPrice(symbol);
  const { data: dcf } = useDCF(symbol);
  const { data: peers } = useStockPeers(symbol);
  const { data: executives } = useKeyExecutives(symbol);
  const { data: employeeHistory } = useEmployeeCount(symbol);

  const handleTickerSelect = (newSymbol: string) => {
    setSymbol(newSymbol);
  };

  const isLoading = profileLoading || quoteLoading;

  // Notify parent of symbol changes for header content
  useEffect(() => {
    if (onSymbolChange) {
      onSymbolChange(
        symbol,
        <>
          <InlineTickerInput value={symbol} onSelect={handleTickerSelect} />
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`text-xs px-2 py-0.5 rounded ml-2 ${
              showDebug
                ? 'bg-accent-blue text-white'
                : 'text-text-primary hover:text-accent-blue'
            }`}
            title="Toggle API Debug Panel"
          >
            Debug
          </button>
        </>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, showDebug]);

  return (
    <>
      <div className="flex flex-col h-full">

        {/* Price Bar */}
        <PriceBar symbol={symbol} quote={quote} />

        {/* Main Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-text-primary">
              <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
              <span>Loading {symbol}...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Company Header */}
              <CompanyHeader profile={profile} />

              {/* Price Chart */}
              <PriceChart
                data={historicalData}
                loading={chartLoading}
                currentPrice={quote?.price}
              />

              {/* Stats Bar */}
              <StatsBar
                quote={quote}
                estimates={estimates}
                onOpenFinancials={() => onOpenFinancials?.(symbol)}
                onOpenEarningsMatrix={() => onOpenEarningsMatrix?.(symbol)}
                onOpenRatios={() => onOpenRatios?.(symbol)}
                onOpenInsiderTrades={() => onOpenInsiderTrades?.(symbol)}
                onOpenCongressTrades={() => onOpenCongressTrades?.(symbol)}
                onOpenDividends={() => onOpenDividends?.(symbol)}
                onOpenPress={() => onOpenPress?.(symbol)}
                onOpenAnalystRatings={() => onOpenAnalystRatings?.(symbol)}
                onOpenSECFilings={() => onOpenSECFilings?.(symbol)}
              />

              {/* Analyst Ratings */}
              <AnalystRatings grades={grades} loading={gradesLoading} />

              {/* Company Info (DCF, Peers, Executives, Employees) */}
              <CompanyInfo
                dcf={dcf}
                peers={peers}
                executives={executives}
                employeeHistory={employeeHistory}
                currentPrice={quote?.price}
                onPeerClick={handleTickerSelect}
              />
            </div>

            {/* Right Snapshot Panel */}
            <SnapshotPanel
              profile={profile}
              metrics={metrics}
              ratios={ratios}
              ratiosTTM={ratiosTTM}
              sharesFloat={sharesFloat}
              latestDividend={dividends[0] || null}
            />
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {showDebug && <DebugPanel isOpen={showDebug} onClose={() => setShowDebug(false)} />}
    </>
  );
}
