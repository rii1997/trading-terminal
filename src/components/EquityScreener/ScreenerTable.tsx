import { useCallback } from 'react';
import type { EnrichedStock } from '../../types/fmp';
import type { SortField, SortDirection } from '../../hooks/useScreener';
import { SparklineChart } from './SparklineChart';
import { formatLargeNumber, formatPercent, formatCurrency, formatVolume } from '../../utils/formatters';

interface ScreenerTableProps {
  results: EnrichedStock[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (symbol: string) => void;
  loading: boolean;
  enriching: boolean;
}

interface ColumnConfig {
  id: SortField | 'sparkline';
  label: string;
  width: string;
  align: 'left' | 'right' | 'center';
  sortable: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'symbol', label: 'Ticker', width: 'w-20', align: 'left', sortable: true },
  { id: 'companyName', label: 'Name', width: 'w-44', align: 'left', sortable: true },
  { id: 'price', label: 'Price', width: 'w-20', align: 'right', sortable: true },
  { id: 'changesPercentage', label: 'Chg%', width: 'w-18', align: 'right', sortable: true },
  { id: 'marketCap', label: 'Mkt Cap', width: 'w-24', align: 'right', sortable: true },
  { id: 'pe', label: 'P/E', width: 'w-16', align: 'right', sortable: true },
  { id: 'volume', label: 'Volume', width: 'w-20', align: 'right', sortable: true },
  { id: 'sector', label: 'Sector', width: 'w-32', align: 'left', sortable: true },
  { id: 'sparkline', label: '30D', width: 'w-16', align: 'center', sortable: false },
];

export function ScreenerTable({
  results,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  loading,
  enriching,
}: ScreenerTableProps) {
  const handleHeaderClick = useCallback((columnId: SortField | 'sparkline') => {
    if (columnId !== 'sparkline') {
      onSort(columnId);
    }
  }, [onSort]);

  const handleRowClick = useCallback((symbol: string) => {
    onRowClick(symbol);
  }, [onRowClick]);

  const getSortIndicator = (columnId: SortField | 'sparkline') => {
    if (columnId === 'sparkline' || columnId !== sortField) {
      return null;
    }
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Screening stocks...</span>
        </div>
      </div>
    );
  }

  if (enriching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-text-secondary border-t-accent-green rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Enriching with quote data...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <p className="text-lg mb-2">No results</p>
          <p className="text-sm">Adjust your filters and click "Screen" to find stocks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-bg-secondary z-10">
          <tr className="border-b border-border">
            {COLUMNS.map((column) => (
              <th
                key={column.id}
                className={`
                  px-2 py-2 font-medium text-text-secondary
                  ${column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center'}
                  ${column.width}
                  ${column.sortable ? 'cursor-pointer hover:text-text-primary' : ''}
                `}
                onClick={() => column.sortable && handleHeaderClick(column.id)}
              >
                {column.label}
                {getSortIndicator(column.id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((stock) => (
            <tr
              key={stock.symbol}
              onClick={() => handleRowClick(stock.symbol)}
              className="border-b border-border/50 hover:bg-bg-tertiary cursor-pointer transition-colors"
            >
              <td className="px-2 py-1.5 font-medium text-accent-blue">
                {stock.symbol}
              </td>
              <td className="px-2 py-1.5 text-text-primary truncate max-w-44" title={stock.companyName}>
                {stock.companyName}
              </td>
              <td className="px-2 py-1.5 text-right text-text-primary">
                {formatCurrency(stock.price)}
              </td>
              <td className={`px-2 py-1.5 text-right ${
                (stock.changesPercentage ?? 0) >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {formatPercent(stock.changesPercentage)}
              </td>
              <td className="px-2 py-1.5 text-right text-text-primary">
                {formatLargeNumber(stock.marketCap)}
              </td>
              <td className="px-2 py-1.5 text-right text-text-secondary">
                {stock.pe !== undefined && stock.pe !== null && !isNaN(stock.pe)
                  ? stock.pe.toFixed(1)
                  : '-'
                }
              </td>
              <td className="px-2 py-1.5 text-right text-text-secondary">
                {formatVolume(stock.volume)}
              </td>
              <td className="px-2 py-1.5 text-text-secondary truncate max-w-32" title={stock.sector}>
                {stock.sector || '-'}
              </td>
              <td className="px-2 py-1.5">
                <SparklineChart
                  data={stock.sparklineData || []}
                  width={50}
                  height={18}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
