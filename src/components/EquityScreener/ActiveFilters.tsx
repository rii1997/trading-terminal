import { useMemo, useCallback } from 'react';
import type { ScreenerFilterState, ActiveFilter } from './types';
import { formatLargeNumber } from '../../utils/formatters';

interface ActiveFiltersProps {
  filters: ScreenerFilterState;
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

// Helper to format range values
function formatRange(
  min: number | undefined,
  max: number | undefined,
  prefix = '',
  suffix = ''
): string {
  if (min !== undefined && max !== undefined) {
    return `${prefix}${min}${suffix} - ${prefix}${max}${suffix}`;
  }
  if (min !== undefined) {
    return `> ${prefix}${min}${suffix}`;
  }
  return `< ${prefix}${max!}${suffix}`;
}

export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];

    // ===== Descriptive Filters =====
    if (filters.server.sector) {
      result.push({ id: 'sector', category: 'descriptive', label: 'Sector', value: filters.server.sector });
    }
    if (filters.server.industry) {
      result.push({ id: 'industry', category: 'descriptive', label: 'Industry', value: filters.server.industry });
    }
    if (filters.server.country) {
      result.push({ id: 'country', category: 'descriptive', label: 'Country', value: filters.server.country });
    }
    if (filters.server.exchange) {
      result.push({ id: 'exchange', category: 'descriptive', label: 'Exchange', value: filters.server.exchange });
    }
    if (filters.server.marketCapMoreThan !== undefined || filters.server.marketCapLowerThan !== undefined) {
      const min = filters.server.marketCapMoreThan;
      const max = filters.server.marketCapLowerThan;
      result.push({
        id: 'marketCap',
        category: 'descriptive',
        label: 'Mkt Cap',
        value: min !== undefined && max !== undefined
          ? `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`
          : min !== undefined ? `> ${formatLargeNumber(min)}` : `< ${formatLargeNumber(max!)}`,
      });
    }
    if (filters.server.priceMoreThan !== undefined || filters.server.priceLowerThan !== undefined) {
      result.push({
        id: 'price',
        category: 'descriptive',
        label: 'Price',
        value: formatRange(filters.server.priceMoreThan, filters.server.priceLowerThan, '$'),
      });
    }
    if (filters.server.volumeMoreThan !== undefined || filters.server.volumeLowerThan !== undefined) {
      const min = filters.server.volumeMoreThan;
      const max = filters.server.volumeLowerThan;
      result.push({
        id: 'volume',
        category: 'descriptive',
        label: 'Volume',
        value: min !== undefined && max !== undefined
          ? `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`
          : min !== undefined ? `> ${formatLargeNumber(min)}` : `< ${formatLargeNumber(max!)}`,
      });
    }
    if (filters.server.isEtf !== undefined) {
      result.push({ id: 'isEtf', category: 'descriptive', label: 'ETF', value: filters.server.isEtf ? 'Yes' : 'No' });
    }
    if (filters.server.isFund !== undefined) {
      result.push({ id: 'isFund', category: 'descriptive', label: 'Fund', value: filters.server.isFund ? 'Yes' : 'No' });
    }

    // ===== Valuation Filters =====
    if (filters.client.peMin !== undefined || filters.client.peMax !== undefined) {
      result.push({ id: 'pe', category: 'valuation', label: 'P/E', value: formatRange(filters.client.peMin, filters.client.peMax) });
    }
    if (filters.client.priceToBookMin !== undefined || filters.client.priceToBookMax !== undefined) {
      result.push({ id: 'priceToBook', category: 'valuation', label: 'P/B', value: formatRange(filters.client.priceToBookMin, filters.client.priceToBookMax) });
    }
    if (filters.client.priceToSalesMin !== undefined || filters.client.priceToSalesMax !== undefined) {
      result.push({ id: 'priceToSales', category: 'valuation', label: 'P/S', value: formatRange(filters.client.priceToSalesMin, filters.client.priceToSalesMax) });
    }
    if (filters.client.priceToFcfMin !== undefined || filters.client.priceToFcfMax !== undefined) {
      result.push({ id: 'priceToFcf', category: 'valuation', label: 'P/FCF', value: formatRange(filters.client.priceToFcfMin, filters.client.priceToFcfMax) });
    }
    if (filters.client.pegMin !== undefined || filters.client.pegMax !== undefined) {
      result.push({ id: 'peg', category: 'valuation', label: 'PEG', value: formatRange(filters.client.pegMin, filters.client.pegMax) });
    }
    if (filters.client.evEbitdaMin !== undefined || filters.client.evEbitdaMax !== undefined) {
      result.push({ id: 'evEbitda', category: 'valuation', label: 'EV/EBITDA', value: formatRange(filters.client.evEbitdaMin, filters.client.evEbitdaMax) });
    }
    if (filters.client.epsMin !== undefined || filters.client.epsMax !== undefined) {
      result.push({ id: 'eps', category: 'valuation', label: 'EPS', value: formatRange(filters.client.epsMin, filters.client.epsMax, '$') });
    }
    if (filters.client.dividendYieldMin !== undefined || filters.client.dividendYieldMax !== undefined) {
      result.push({ id: 'dividendYield', category: 'valuation', label: 'Div Yield', value: formatRange(filters.client.dividendYieldMin, filters.client.dividendYieldMax, '', '%') });
    }

    // ===== Profitability Filters =====
    if (filters.client.grossMarginMin !== undefined || filters.client.grossMarginMax !== undefined) {
      result.push({ id: 'grossMargin', category: 'profitability', label: 'Gross Margin', value: formatRange(filters.client.grossMarginMin, filters.client.grossMarginMax, '', '%') });
    }
    if (filters.client.operatingMarginMin !== undefined || filters.client.operatingMarginMax !== undefined) {
      result.push({ id: 'operatingMargin', category: 'profitability', label: 'Op Margin', value: formatRange(filters.client.operatingMarginMin, filters.client.operatingMarginMax, '', '%') });
    }
    if (filters.client.netMarginMin !== undefined || filters.client.netMarginMax !== undefined) {
      result.push({ id: 'netMargin', category: 'profitability', label: 'Net Margin', value: formatRange(filters.client.netMarginMin, filters.client.netMarginMax, '', '%') });
    }
    if (filters.client.roaMin !== undefined || filters.client.roaMax !== undefined) {
      result.push({ id: 'roa', category: 'profitability', label: 'ROA', value: formatRange(filters.client.roaMin, filters.client.roaMax, '', '%') });
    }
    if (filters.client.roeMin !== undefined || filters.client.roeMax !== undefined) {
      result.push({ id: 'roe', category: 'profitability', label: 'ROE', value: formatRange(filters.client.roeMin, filters.client.roeMax, '', '%') });
    }
    if (filters.client.roceMin !== undefined || filters.client.roceMax !== undefined) {
      result.push({ id: 'roce', category: 'profitability', label: 'ROCE', value: formatRange(filters.client.roceMin, filters.client.roceMax, '', '%') });
    }

    // ===== Financial Health Filters =====
    if (filters.client.currentRatioMin !== undefined || filters.client.currentRatioMax !== undefined) {
      result.push({ id: 'currentRatio', category: 'financial', label: 'Current Ratio', value: formatRange(filters.client.currentRatioMin, filters.client.currentRatioMax) });
    }
    if (filters.client.quickRatioMin !== undefined || filters.client.quickRatioMax !== undefined) {
      result.push({ id: 'quickRatio', category: 'financial', label: 'Quick Ratio', value: formatRange(filters.client.quickRatioMin, filters.client.quickRatioMax) });
    }
    if (filters.client.cashRatioMin !== undefined || filters.client.cashRatioMax !== undefined) {
      result.push({ id: 'cashRatio', category: 'financial', label: 'Cash Ratio', value: formatRange(filters.client.cashRatioMin, filters.client.cashRatioMax) });
    }
    if (filters.client.debtRatioMin !== undefined || filters.client.debtRatioMax !== undefined) {
      result.push({ id: 'debtRatio', category: 'financial', label: 'Debt Ratio', value: formatRange(filters.client.debtRatioMin, filters.client.debtRatioMax) });
    }
    if (filters.client.debtEquityMin !== undefined || filters.client.debtEquityMax !== undefined) {
      result.push({ id: 'debtEquity', category: 'financial', label: 'D/E', value: formatRange(filters.client.debtEquityMin, filters.client.debtEquityMax) });
    }
    if (filters.client.interestCoverageMin !== undefined || filters.client.interestCoverageMax !== undefined) {
      result.push({ id: 'interestCoverage', category: 'financial', label: 'Int Coverage', value: formatRange(filters.client.interestCoverageMin, filters.client.interestCoverageMax) });
    }
    if (filters.client.assetTurnoverMin !== undefined || filters.client.assetTurnoverMax !== undefined) {
      result.push({ id: 'assetTurnover', category: 'financial', label: 'Asset Turn', value: formatRange(filters.client.assetTurnoverMin, filters.client.assetTurnoverMax) });
    }
    if (filters.client.inventoryTurnoverMin !== undefined || filters.client.inventoryTurnoverMax !== undefined) {
      result.push({ id: 'inventoryTurnover', category: 'financial', label: 'Inv Turn', value: formatRange(filters.client.inventoryTurnoverMin, filters.client.inventoryTurnoverMax) });
    }
    if (filters.client.fcfPerShareMin !== undefined || filters.client.fcfPerShareMax !== undefined) {
      result.push({ id: 'fcfPerShare', category: 'financial', label: 'FCF/Share', value: formatRange(filters.client.fcfPerShareMin, filters.client.fcfPerShareMax, '$') });
    }
    if (filters.client.payoutRatioMin !== undefined || filters.client.payoutRatioMax !== undefined) {
      result.push({ id: 'payoutRatio', category: 'financial', label: 'Payout', value: formatRange(filters.client.payoutRatioMin, filters.client.payoutRatioMax, '', '%') });
    }

    // ===== Technical Filters =====
    if (filters.server.betaMoreThan !== undefined || filters.server.betaLowerThan !== undefined) {
      result.push({ id: 'beta', category: 'technical', label: 'Beta', value: formatRange(filters.server.betaMoreThan, filters.server.betaLowerThan) });
    }
    if (filters.client.priceVsSma50) {
      result.push({
        id: 'sma50',
        category: 'technical',
        label: 'SMA50',
        value: `${filters.client.priceVsSma50}${filters.client.sma50Percent ? ` ${filters.client.sma50Percent}%` : ''}`,
      });
    }
    if (filters.client.priceVsSma200) {
      result.push({
        id: 'sma200',
        category: 'technical',
        label: 'SMA200',
        value: `${filters.client.priceVsSma200}${filters.client.sma200Percent ? ` ${filters.client.sma200Percent}%` : ''}`,
      });
    }
    if (filters.client.nearYearHighPct !== undefined) {
      result.push({ id: 'nearYearHigh', category: 'technical', label: '52W High', value: `within ${filters.client.nearYearHighPct}%` });
    }
    if (filters.client.nearYearLowPct !== undefined) {
      result.push({ id: 'nearYearLow', category: 'technical', label: '52W Low', value: `within ${filters.client.nearYearLowPct}%` });
    }
    if (filters.client.dayChangePctMin !== undefined || filters.client.dayChangePctMax !== undefined) {
      result.push({ id: 'dayChange', category: 'technical', label: 'Day Chg', value: formatRange(filters.client.dayChangePctMin, filters.client.dayChangePctMax, '', '%') });
    }
    if (filters.client.avgVolumeMin !== undefined || filters.client.avgVolumeMax !== undefined) {
      const min = filters.client.avgVolumeMin;
      const max = filters.client.avgVolumeMax;
      result.push({
        id: 'avgVolume',
        category: 'technical',
        label: 'Avg Vol',
        value: min !== undefined && max !== undefined
          ? `${formatLargeNumber(min)} - ${formatLargeNumber(max)}`
          : min !== undefined ? `> ${formatLargeNumber(min)}` : `< ${formatLargeNumber(max!)}`,
      });
    }

    return result;
  }, [filters]);

  const handleRemove = useCallback((filterId: string) => {
    onRemoveFilter(filterId);
  }, [onRemoveFilter]);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-bg-tertiary border-b border-border">
      <span className="text-xs text-text-secondary">Active:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-bg-secondary border border-border rounded"
        >
          <span className="text-text-secondary">{filter.label}:</span>
          <span className="text-text-primary">{filter.value}</span>
          <button
            onClick={() => handleRemove(filter.id)}
            className="ml-1 text-text-secondary hover:text-accent-red focus:outline-none"
            aria-label={`Remove ${filter.label} filter`}
          >
            x
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-accent-blue hover:text-accent-blue/80 focus:outline-none"
      >
        Clear All
      </button>
    </div>
  );
}
