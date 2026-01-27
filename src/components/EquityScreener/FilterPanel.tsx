import { useCallback } from 'react';
import { RangeSlider } from './RangeSlider';
import { SelectFilter, ToggleFilter, SmaFilter } from './SelectFilter';
import type { FilterTab, ScreenerFilterState } from './types';
import { SECTOR_OPTIONS, EXCHANGE_OPTIONS, COUNTRY_OPTIONS } from './types';
import { formatLargeNumber } from '../../utils/formatters';

interface FilterPanelProps {
  activeTab: FilterTab;
  filters: ScreenerFilterState;
  onFiltersChange: (filters: ScreenerFilterState) => void;
  onScreen: () => void;
  onReset: () => void;
  loading: boolean;
}

export function FilterPanel({
  activeTab,
  filters,
  onFiltersChange,
  onScreen,
  onReset,
  loading,
}: FilterPanelProps) {
  // Server filter update helper
  const updateServerFilter = useCallback(<K extends keyof ScreenerFilterState['server']>(
    key: K,
    value: ScreenerFilterState['server'][K]
  ) => {
    onFiltersChange({
      ...filters,
      server: { ...filters.server, [key]: value },
    });
  }, [filters, onFiltersChange]);

  // Client filter update helper
  const updateClientFilter = useCallback(<K extends keyof ScreenerFilterState['client']>(
    key: K,
    value: ScreenerFilterState['client'][K]
  ) => {
    onFiltersChange({
      ...filters,
      client: { ...filters.client, [key]: value },
    });
  }, [filters, onFiltersChange]);

  // Generic range handler factory
  const createRangeHandler = useCallback((
    minKey: keyof ScreenerFilterState['client'],
    maxKey: keyof ScreenerFilterState['client']
  ) => {
    return (min: number | undefined, max: number | undefined) => {
      onFiltersChange({
        ...filters,
        client: {
          ...filters.client,
          [minKey]: min,
          [maxKey]: max,
        },
      });
    };
  }, [filters, onFiltersChange]);

  // Server range handler factory
  const createServerRangeHandler = useCallback((
    minKey: keyof ScreenerFilterState['server'],
    maxKey: keyof ScreenerFilterState['server']
  ) => {
    return (min: number | undefined, max: number | undefined) => {
      onFiltersChange({
        ...filters,
        server: {
          ...filters.server,
          [minKey]: min,
          [maxKey]: max,
        },
      });
    };
  }, [filters, onFiltersChange]);

  return (
    <div className="p-3 border-b border-border bg-bg-secondary">
      {/* Descriptive Tab */}
      {activeTab === 'descriptive' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <SelectFilter
            label="Sector"
            options={SECTOR_OPTIONS}
            value={filters.server.sector || ''}
            onChange={(v) => updateServerFilter('sector', v || undefined)}
            disabled={loading}
          />
          <SelectFilter
            label="Exchange"
            options={EXCHANGE_OPTIONS}
            value={filters.server.exchange || ''}
            onChange={(v) => updateServerFilter('exchange', v || undefined)}
            disabled={loading}
          />
          <SelectFilter
            label="Country"
            options={COUNTRY_OPTIONS}
            value={filters.server.country || ''}
            onChange={(v) => updateServerFilter('country', v || undefined)}
            disabled={loading}
          />
          <RangeSlider
            label="Market Cap"
            min={0}
            max={5000000000000}
            step={1000000000}
            valueMin={filters.server.marketCapMoreThan}
            valueMax={filters.server.marketCapLowerThan}
            onChange={createServerRangeHandler('marketCapMoreThan', 'marketCapLowerThan')}
            format={formatLargeNumber}
            disabled={loading}
          />
          <RangeSlider
            label="Price ($)"
            min={0}
            max={10000}
            step={1}
            valueMin={filters.server.priceMoreThan}
            valueMax={filters.server.priceLowerThan}
            format={(v) => `$${v}`}
            onChange={createServerRangeHandler('priceMoreThan', 'priceLowerThan')}
            disabled={loading}
          />
          <RangeSlider
            label="Volume"
            min={0}
            max={1000000000}
            step={100000}
            valueMin={filters.server.volumeMoreThan}
            valueMax={filters.server.volumeLowerThan}
            format={formatLargeNumber}
            onChange={createServerRangeHandler('volumeMoreThan', 'volumeLowerThan')}
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            <ToggleFilter
              label="Is ETF"
              value={filters.server.isEtf}
              onChange={(v) => updateServerFilter('isEtf', v)}
              disabled={loading}
            />
            <ToggleFilter
              label="Is Fund"
              value={filters.server.isFund}
              onChange={(v) => updateServerFilter('isFund', v)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Valuation Tab */}
      {activeTab === 'valuation' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <RangeSlider
              label="P/E Ratio"
              min={0}
              max={500}
              step={1}
              valueMin={filters.client.peMin}
              valueMax={filters.client.peMax}
              onChange={createRangeHandler('peMin', 'peMax')}
              disabled={loading}
            />
            <RangeSlider
              label="P/B Ratio"
              min={0}
              max={50}
              step={0.1}
              valueMin={filters.client.priceToBookMin}
              valueMax={filters.client.priceToBookMax}
              onChange={createRangeHandler('priceToBookMin', 'priceToBookMax')}
              disabled={loading}
            />
            <RangeSlider
              label="P/S Ratio"
              min={0}
              max={50}
              step={0.1}
              valueMin={filters.client.priceToSalesMin}
              valueMax={filters.client.priceToSalesMax}
              onChange={createRangeHandler('priceToSalesMin', 'priceToSalesMax')}
              disabled={loading}
            />
            <RangeSlider
              label="P/FCF Ratio"
              min={0}
              max={100}
              step={1}
              valueMin={filters.client.priceToFcfMin}
              valueMax={filters.client.priceToFcfMax}
              onChange={createRangeHandler('priceToFcfMin', 'priceToFcfMax')}
              disabled={loading}
            />
            <RangeSlider
              label="PEG Ratio"
              min={0}
              max={10}
              step={0.1}
              valueMin={filters.client.pegMin}
              valueMax={filters.client.pegMax}
              onChange={createRangeHandler('pegMin', 'pegMax')}
              disabled={loading}
            />
            <RangeSlider
              label="EV/EBITDA"
              min={0}
              max={100}
              step={1}
              valueMin={filters.client.evEbitdaMin}
              valueMax={filters.client.evEbitdaMax}
              onChange={createRangeHandler('evEbitdaMin', 'evEbitdaMax')}
              disabled={loading}
            />
            <RangeSlider
              label="EPS ($)"
              min={-100}
              max={1000}
              step={0.1}
              valueMin={filters.client.epsMin}
              valueMax={filters.client.epsMax}
              format={(v) => `$${v}`}
              onChange={createRangeHandler('epsMin', 'epsMax')}
              disabled={loading}
            />
            <RangeSlider
              label="Dividend Yield (%)"
              min={0}
              max={20}
              step={0.1}
              valueMin={filters.client.dividendYieldMin}
              valueMax={filters.client.dividendYieldMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('dividendYieldMin', 'dividendYieldMax')}
              disabled={loading}
            />
          </div>
          <div className="text-[10px] text-text-secondary italic">
            Valuation data requires individual API calls. Only the first 100 results are enriched with this data.
          </div>
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <RangeSlider
              label="Gross Margin (%)"
              min={-50}
              max={100}
              step={1}
              valueMin={filters.client.grossMarginMin}
              valueMax={filters.client.grossMarginMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('grossMarginMin', 'grossMarginMax')}
              disabled={loading}
            />
            <RangeSlider
              label="Operating Margin (%)"
              min={-100}
              max={100}
              step={1}
              valueMin={filters.client.operatingMarginMin}
              valueMax={filters.client.operatingMarginMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('operatingMarginMin', 'operatingMarginMax')}
              disabled={loading}
            />
            <RangeSlider
              label="Net Margin (%)"
              min={-100}
              max={100}
              step={1}
              valueMin={filters.client.netMarginMin}
              valueMax={filters.client.netMarginMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('netMarginMin', 'netMarginMax')}
              disabled={loading}
            />
            <RangeSlider
              label="ROA (%)"
              min={-50}
              max={100}
              step={1}
              valueMin={filters.client.roaMin}
              valueMax={filters.client.roaMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('roaMin', 'roaMax')}
              disabled={loading}
            />
            <RangeSlider
              label="ROE (%)"
              min={-100}
              max={200}
              step={1}
              valueMin={filters.client.roeMin}
              valueMax={filters.client.roeMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('roeMin', 'roeMax')}
              disabled={loading}
            />
            <RangeSlider
              label="ROCE (%)"
              min={-50}
              max={100}
              step={1}
              valueMin={filters.client.roceMin}
              valueMax={filters.client.roceMax}
              format={(v) => `${v}%`}
              onChange={createRangeHandler('roceMin', 'roceMax')}
              disabled={loading}
            />
          </div>
          <div className="text-[10px] text-text-secondary italic">
            Profitability data requires individual API calls. Only the first 100 results are enriched with this data.
          </div>
        </div>
      )}

      {/* Financial Health Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-3">
          {/* Liquidity Section */}
          <div>
            <div className="text-xs text-text-secondary mb-2 font-medium">Liquidity Ratios</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <RangeSlider
                label="Current Ratio"
                min={0}
                max={10}
                step={0.1}
                valueMin={filters.client.currentRatioMin}
                valueMax={filters.client.currentRatioMax}
                onChange={createRangeHandler('currentRatioMin', 'currentRatioMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Quick Ratio"
                min={0}
                max={10}
                step={0.1}
                valueMin={filters.client.quickRatioMin}
                valueMax={filters.client.quickRatioMax}
                onChange={createRangeHandler('quickRatioMin', 'quickRatioMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Cash Ratio"
                min={0}
                max={5}
                step={0.1}
                valueMin={filters.client.cashRatioMin}
                valueMax={filters.client.cashRatioMax}
                onChange={createRangeHandler('cashRatioMin', 'cashRatioMax')}
                disabled={loading}
              />
            </div>
          </div>

          {/* Debt/Leverage Section */}
          <div>
            <div className="text-xs text-text-secondary mb-2 font-medium">Debt & Leverage</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <RangeSlider
                label="Debt Ratio"
                min={0}
                max={2}
                step={0.01}
                valueMin={filters.client.debtRatioMin}
                valueMax={filters.client.debtRatioMax}
                onChange={createRangeHandler('debtRatioMin', 'debtRatioMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Debt/Equity"
                min={0}
                max={10}
                step={0.1}
                valueMin={filters.client.debtEquityMin}
                valueMax={filters.client.debtEquityMax}
                onChange={createRangeHandler('debtEquityMin', 'debtEquityMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Interest Coverage"
                min={0}
                max={50}
                step={0.5}
                valueMin={filters.client.interestCoverageMin}
                valueMax={filters.client.interestCoverageMax}
                onChange={createRangeHandler('interestCoverageMin', 'interestCoverageMax')}
                disabled={loading}
              />
            </div>
          </div>

          {/* Efficiency Section */}
          <div>
            <div className="text-xs text-text-secondary mb-2 font-medium">Efficiency</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <RangeSlider
                label="Asset Turnover"
                min={0}
                max={5}
                step={0.1}
                valueMin={filters.client.assetTurnoverMin}
                valueMax={filters.client.assetTurnoverMax}
                onChange={createRangeHandler('assetTurnoverMin', 'assetTurnoverMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Inventory Turnover"
                min={0}
                max={50}
                step={0.5}
                valueMin={filters.client.inventoryTurnoverMin}
                valueMax={filters.client.inventoryTurnoverMax}
                onChange={createRangeHandler('inventoryTurnoverMin', 'inventoryTurnoverMax')}
                disabled={loading}
              />
              <RangeSlider
                label="FCF/Share ($)"
                min={-50}
                max={200}
                step={1}
                valueMin={filters.client.fcfPerShareMin}
                valueMax={filters.client.fcfPerShareMax}
                format={(v) => `$${v}`}
                onChange={createRangeHandler('fcfPerShareMin', 'fcfPerShareMax')}
                disabled={loading}
              />
              <RangeSlider
                label="Payout Ratio (%)"
                min={0}
                max={200}
                step={1}
                valueMin={filters.client.payoutRatioMin}
                valueMax={filters.client.payoutRatioMax}
                format={(v) => `${v}%`}
                onChange={createRangeHandler('payoutRatioMin', 'payoutRatioMax')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="text-[10px] text-text-secondary italic">
            Financial data requires individual API calls. Only the first 100 results are enriched with this data.
          </div>
        </div>
      )}

      {/* Technical Tab */}
      {activeTab === 'technical' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <RangeSlider
            label="Beta"
            min={-2}
            max={5}
            step={0.1}
            valueMin={filters.server.betaMoreThan}
            valueMax={filters.server.betaLowerThan}
            onChange={createServerRangeHandler('betaMoreThan', 'betaLowerThan')}
            disabled={loading}
          />
          <SmaFilter
            label="Price vs SMA50"
            direction={filters.client.priceVsSma50}
            percent={filters.client.sma50Percent}
            onDirectionChange={(v) => updateClientFilter('priceVsSma50', v)}
            onPercentChange={(v) => updateClientFilter('sma50Percent', v)}
            disabled={loading}
          />
          <SmaFilter
            label="Price vs SMA200"
            direction={filters.client.priceVsSma200}
            percent={filters.client.sma200Percent}
            onDirectionChange={(v) => updateClientFilter('priceVsSma200', v)}
            onPercentChange={(v) => updateClientFilter('sma200Percent', v)}
            disabled={loading}
          />
          <RangeSlider
            label="Near 52W High (%)"
            min={0}
            max={100}
            step={1}
            valueMin={filters.client.nearYearHighPct}
            valueMax={undefined}
            onChange={(min) => updateClientFilter('nearYearHighPct', min)}
            format={(v) => `${v}%`}
            disabled={loading}
          />
          <RangeSlider
            label="Near 52W Low (%)"
            min={0}
            max={100}
            step={1}
            valueMin={filters.client.nearYearLowPct}
            valueMax={undefined}
            onChange={(min) => updateClientFilter('nearYearLowPct', min)}
            format={(v) => `${v}%`}
            disabled={loading}
          />
          <RangeSlider
            label="Day Change (%)"
            min={-50}
            max={50}
            step={0.5}
            valueMin={filters.client.dayChangePctMin}
            valueMax={filters.client.dayChangePctMax}
            format={(v) => `${v}%`}
            onChange={createRangeHandler('dayChangePctMin', 'dayChangePctMax')}
            disabled={loading}
          />
          <RangeSlider
            label="Avg Volume"
            min={0}
            max={500000000}
            step={100000}
            valueMin={filters.client.avgVolumeMin}
            valueMax={filters.client.avgVolumeMax}
            format={formatLargeNumber}
            onChange={createRangeHandler('avgVolumeMin', 'avgVolumeMax')}
            disabled={loading}
          />
          <div className="text-xs text-text-secondary italic">
            Note: RSI, ATR, and other technical indicators are not available.
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
        <button
          onClick={onReset}
          disabled={loading}
          className="px-3 py-1 text-xs bg-bg-tertiary text-text-secondary rounded
                     hover:bg-bg-primary hover:text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onScreen}
          disabled={loading}
          className="px-4 py-1 text-xs bg-accent-blue text-white rounded
                     hover:bg-accent-blue/80
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Screening...' : 'Screen'}
        </button>
      </div>
    </div>
  );
}
