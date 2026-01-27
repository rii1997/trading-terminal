import { useState, useCallback, type ReactNode, useEffect } from 'react';
import { FilterTabs } from './FilterTabs';
import { FilterPanel } from './FilterPanel';
import { ActiveFilters } from './ActiveFilters';
import { ScreenerTable } from './ScreenerTable';
import { Pagination } from './Pagination';
import { useScreener } from '../../hooks/useScreener';
import type { FilterTab, ScreenerFilterState } from './types';
import { DEFAULT_FILTER_STATE } from './types';

interface EquityScreenerProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
  onOpenFinancials?: (symbol: string) => void;
  onOpenNews?: (symbol: string) => void;
}

export function EquityScreener({
  onSymbolChange,
  onOpenDescription,
  onOpenFinancials: _onOpenFinancials,
  onOpenNews: _onOpenNews,
}: EquityScreenerProps) {
  // Note: onOpenFinancials and onOpenNews are available for future context menu/button features
  void _onOpenFinancials;
  void _onOpenNews;
  const [activeTab, setActiveTab] = useState<FilterTab>('descriptive');
  const [filters, setFilters] = useState<ScreenerFilterState>(DEFAULT_FILTER_STATE);
  const [filterPanelCollapsed, _setFilterPanelCollapsed] = useState(false);
  void _setFilterPanelCollapsed; // Reserved for future collapse toggle feature

  const {
    paginatedResults,
    totalResults,
    loading,
    enriching,
    error,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    sortField,
    sortDirection,
    setSort,
    runScreen,
    reset,
  } = useScreener();

  // Update header content - only run once on mount
  useEffect(() => {
    if (onSymbolChange) {
      onSymbolChange('', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScreen = useCallback(() => {
    runScreen(filters.server, filters.client);
  }, [runScreen, filters]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    reset();
  }, [reset]);

  const handleRowClick = useCallback((symbol: string) => {
    // Open Description window by default
    if (onOpenDescription) {
      onOpenDescription(symbol);
    }
  }, [onOpenDescription]);

  const handleRemoveFilter = useCallback((filterId: string) => {
    setFilters(prev => {
      const newFilters: ScreenerFilterState = {
        server: { ...prev.server },
        client: { ...prev.client },
      };

      // Remove filters based on ID
      switch (filterId) {
        // ===== Descriptive (Server) =====
        case 'sector': delete newFilters.server.sector; break;
        case 'industry': delete newFilters.server.industry; break;
        case 'country': delete newFilters.server.country; break;
        case 'exchange': delete newFilters.server.exchange; break;
        case 'marketCap':
          delete newFilters.server.marketCapMoreThan;
          delete newFilters.server.marketCapLowerThan;
          break;
        case 'price':
          delete newFilters.server.priceMoreThan;
          delete newFilters.server.priceLowerThan;
          break;
        case 'volume':
          delete newFilters.server.volumeMoreThan;
          delete newFilters.server.volumeLowerThan;
          break;
        case 'isEtf': delete newFilters.server.isEtf; break;
        case 'isFund': delete newFilters.server.isFund; break;

        // ===== Valuation =====
        case 'pe':
          delete newFilters.client.peMin;
          delete newFilters.client.peMax;
          break;
        case 'priceToBook':
          delete newFilters.client.priceToBookMin;
          delete newFilters.client.priceToBookMax;
          break;
        case 'priceToSales':
          delete newFilters.client.priceToSalesMin;
          delete newFilters.client.priceToSalesMax;
          break;
        case 'priceToFcf':
          delete newFilters.client.priceToFcfMin;
          delete newFilters.client.priceToFcfMax;
          break;
        case 'peg':
          delete newFilters.client.pegMin;
          delete newFilters.client.pegMax;
          break;
        case 'evEbitda':
          delete newFilters.client.evEbitdaMin;
          delete newFilters.client.evEbitdaMax;
          break;
        case 'eps':
          delete newFilters.client.epsMin;
          delete newFilters.client.epsMax;
          break;
        case 'dividendYield':
          delete newFilters.client.dividendYieldMin;
          delete newFilters.client.dividendYieldMax;
          break;

        // ===== Profitability =====
        case 'grossMargin':
          delete newFilters.client.grossMarginMin;
          delete newFilters.client.grossMarginMax;
          break;
        case 'operatingMargin':
          delete newFilters.client.operatingMarginMin;
          delete newFilters.client.operatingMarginMax;
          break;
        case 'netMargin':
          delete newFilters.client.netMarginMin;
          delete newFilters.client.netMarginMax;
          break;
        case 'roa':
          delete newFilters.client.roaMin;
          delete newFilters.client.roaMax;
          break;
        case 'roe':
          delete newFilters.client.roeMin;
          delete newFilters.client.roeMax;
          break;
        case 'roce':
          delete newFilters.client.roceMin;
          delete newFilters.client.roceMax;
          break;

        // ===== Financial Health =====
        case 'currentRatio':
          delete newFilters.client.currentRatioMin;
          delete newFilters.client.currentRatioMax;
          break;
        case 'quickRatio':
          delete newFilters.client.quickRatioMin;
          delete newFilters.client.quickRatioMax;
          break;
        case 'cashRatio':
          delete newFilters.client.cashRatioMin;
          delete newFilters.client.cashRatioMax;
          break;
        case 'debtRatio':
          delete newFilters.client.debtRatioMin;
          delete newFilters.client.debtRatioMax;
          break;
        case 'debtEquity':
          delete newFilters.client.debtEquityMin;
          delete newFilters.client.debtEquityMax;
          break;
        case 'interestCoverage':
          delete newFilters.client.interestCoverageMin;
          delete newFilters.client.interestCoverageMax;
          break;
        case 'assetTurnover':
          delete newFilters.client.assetTurnoverMin;
          delete newFilters.client.assetTurnoverMax;
          break;
        case 'inventoryTurnover':
          delete newFilters.client.inventoryTurnoverMin;
          delete newFilters.client.inventoryTurnoverMax;
          break;
        case 'fcfPerShare':
          delete newFilters.client.fcfPerShareMin;
          delete newFilters.client.fcfPerShareMax;
          break;
        case 'payoutRatio':
          delete newFilters.client.payoutRatioMin;
          delete newFilters.client.payoutRatioMax;
          break;

        // ===== Technical =====
        case 'beta':
          delete newFilters.server.betaMoreThan;
          delete newFilters.server.betaLowerThan;
          break;
        case 'sma50':
          delete newFilters.client.priceVsSma50;
          delete newFilters.client.sma50Percent;
          break;
        case 'sma200':
          delete newFilters.client.priceVsSma200;
          delete newFilters.client.sma200Percent;
          break;
        case 'nearYearHigh':
          delete newFilters.client.nearYearHighPct;
          break;
        case 'nearYearLow':
          delete newFilters.client.nearYearLowPct;
          break;
        case 'dayChange':
          delete newFilters.client.dayChangePctMin;
          delete newFilters.client.dayChangePctMax;
          break;
        case 'avgVolume':
          delete newFilters.client.avgVolumeMin;
          delete newFilters.client.avgVolumeMax;
          break;
      }

      return newFilters;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Tab navigation */}
      <FilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        resultCount={totalResults}
      />

      {/* Active filters display */}
      <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
      />

      {/* Filter panel */}
      {!filterPanelCollapsed && (
        <FilterPanel
          activeTab={activeTab}
          filters={filters}
          onFiltersChange={setFilters}
          onScreen={handleScreen}
          onReset={handleReset}
          loading={loading || enriching}
        />
      )}

      {/* Error display */}
      {error && (
        <div className="px-3 py-2 bg-accent-red/10 border-b border-accent-red/30 text-accent-red text-xs">
          Error: {error.message}
        </div>
      )}

      {/* Results table */}
      <ScreenerTable
        results={paginatedResults}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={setSort}
        onRowClick={handleRowClick}
        loading={loading}
        enriching={enriching}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
