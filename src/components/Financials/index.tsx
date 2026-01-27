import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InlineTickerInput } from '../StockDescription/InlineTickerInput';
import { useIncomeStatement, useBalanceSheet, useCashFlow } from '../../hooks/useFinancialStatements';
import { DraggableWindow } from '../DraggableWindow';
import { MetricChart } from './MetricChart';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '../../types/fmp';

interface FinancialsProps {
  onSymbolChange?: (symbol: string, headerContent: React.ReactNode) => void;
  initialSymbol?: string;
}

interface ChartWindow {
  id: string;
  label: string;
  key?: string;
  compute?: (item: Record<string, number>, prevItem?: Record<string, number>) => number | null;
  isMargin?: boolean;
}

type StatementType = 'income' | 'balance' | 'cashflow';
type PeriodType = 'quarter' | 'annual';

// Format number in millions
function formatMillions(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const millions = value / 1_000_000;
  if (Math.abs(millions) < 1) {
    return millions.toFixed(1);
  }
  // Format with commas and no decimals
  const formatted = Math.round(millions).toLocaleString('en-US');
  // Add parentheses for negative numbers
  if (millions < 0) {
    return `(${Math.abs(Math.round(millions)).toLocaleString('en-US')})`;
  }
  return formatted;
}

// Format percentage
function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '-';
  const percent = value * 100;
  return `${percent >= 0 ? '' : ''}${percent.toFixed(1)}%`;
}

// Get period label for column header
function getPeriodLabel(item: { date: string; period: string; fiscalYear: string }, isQuarterly: boolean): string {
  if (isQuarterly) {
    const quarter = item.period || '';
    const year = item.fiscalYear || item.date.substring(0, 4);
    return `${quarter} ${year}`;
  }
  return item.fiscalYear || item.date.substring(0, 4);
}

interface RowConfig {
  label: string;
  key?: string;
  compute?: (item: Record<string, number>, prevItem?: Record<string, number>) => number | null;
  isHeader?: boolean;
  isMargin?: boolean;
}

// Income statement row configuration
const incomeRows: RowConfig[] = [
  { label: 'Revenue', key: 'revenue' },
  { label: 'COGS', key: 'costOfRevenue' },
  { label: 'Gross Profit', key: 'grossProfit' },
  { label: 'SG&A Expense', key: 'sellingGeneralAndAdministrativeExpenses' },
  { label: 'R&D Expense', key: 'researchAndDevelopmentExpenses' },
  { label: 'Operating Expenses', key: 'operatingExpenses' },
  { label: 'Operating Income', key: 'operatingIncome' },
  { label: 'Other Income', key: 'totalOtherIncomeExpensesNet' },
  { label: 'Pretax Income', key: 'incomeBeforeTax' },
  { label: 'Income Taxes', key: 'incomeTaxExpense' },
  { label: 'Net Income', key: 'netIncome' },
  { label: '', isHeader: true },
  { label: 'Gross Profit Margin', isMargin: true, compute: (item) => item.grossProfit / item.revenue },
  { label: 'Operating Profit Margin', isMargin: true, compute: (item) => item.operatingIncome / item.revenue },
  { label: 'Net Profit Margin', isMargin: true, compute: (item) => item.netIncome / item.revenue },
  { label: 'R&D as % of Revenue', isMargin: true, compute: (item) => item.researchAndDevelopmentExpenses / item.revenue },
  { label: 'SG&A as % of Revenue', isMargin: true, compute: (item) => item.sellingGeneralAndAdministrativeExpenses / item.revenue },
  { label: 'Revenue Growth', isMargin: true, compute: (item, prevItem) => prevItem ? (item.revenue - prevItem.revenue) / prevItem.revenue : null },
];

// Balance sheet row configuration
const balanceRows: RowConfig[] = [
  { label: 'ASSETS', isHeader: true },
  { label: 'Cash & Equivalents', key: 'cashAndCashEquivalents' },
  { label: 'Short-Term Investments', key: 'shortTermInvestments' },
  { label: 'Accounts Receivable', key: 'accountsReceivables' },
  { label: 'Inventory', key: 'inventory' },
  { label: 'Other Current Assets', key: 'otherCurrentAssets' },
  { label: 'Total Current Assets', key: 'totalCurrentAssets' },
  { label: 'PP&E Net', key: 'propertyPlantEquipmentNet' },
  { label: 'Goodwill', key: 'goodwill' },
  { label: 'Intangibles', key: 'intangibleAssets' },
  { label: 'Long-Term Investments', key: 'longTermInvestments' },
  { label: 'Other Non-Current Assets', key: 'otherNonCurrentAssets' },
  { label: 'Total Non-Current Assets', key: 'totalNonCurrentAssets' },
  { label: 'Total Assets', key: 'totalAssets' },
  { label: '', isHeader: true },
  { label: 'LIABILITIES', isHeader: true },
  { label: 'Accounts Payable', key: 'accountPayables' },
  { label: 'Short-Term Debt', key: 'shortTermDebt' },
  { label: 'Other Current Liabilities', key: 'otherCurrentLiabilities' },
  { label: 'Total Current Liabilities', key: 'totalCurrentLiabilities' },
  { label: 'Long-Term Debt', key: 'longTermDebt' },
  { label: 'Other Non-Current Liabilities', key: 'otherNonCurrentLiabilities' },
  { label: 'Total Non-Current Liabilities', key: 'totalNonCurrentLiabilities' },
  { label: 'Total Liabilities', key: 'totalLiabilities' },
  { label: '', isHeader: true },
  { label: 'EQUITY', isHeader: true },
  { label: 'Common Stock', key: 'commonStock' },
  { label: 'Retained Earnings', key: 'retainedEarnings' },
  { label: 'Total Stockholders Equity', key: 'totalStockholdersEquity' },
  { label: 'Total Liabilities & Equity', key: 'totalLiabilitiesAndTotalEquity' },
  { label: '', isHeader: true },
  { label: 'Total Debt', key: 'totalDebt' },
  { label: 'Net Debt', key: 'netDebt' },
];

// Cash flow row configuration
const cashFlowRows: RowConfig[] = [
  { label: 'OPERATING ACTIVITIES', isHeader: true },
  { label: 'Net Income', key: 'netIncome' },
  { label: 'Depreciation & Amortization', key: 'depreciationAndAmortization' },
  { label: 'Stock-Based Compensation', key: 'stockBasedCompensation' },
  { label: 'Change in Working Capital', key: 'changeInWorkingCapital' },
  { label: 'Other Non-Cash Items', key: 'otherNonCashItems' },
  { label: 'Operating Cash Flow', key: 'netCashProvidedByOperatingActivities' },
  { label: '', isHeader: true },
  { label: 'INVESTING ACTIVITIES', isHeader: true },
  { label: 'Capital Expenditure', key: 'capitalExpenditure' },
  { label: 'Acquisitions', key: 'acquisitionsNet' },
  { label: 'Purchases of Investments', key: 'purchasesOfInvestments' },
  { label: 'Sales of Investments', key: 'salesMaturitiesOfInvestments' },
  { label: 'Other Investing', key: 'otherInvestingActivities' },
  { label: 'Investing Cash Flow', key: 'netCashProvidedByInvestingActivities' },
  { label: '', isHeader: true },
  { label: 'FINANCING ACTIVITIES', isHeader: true },
  { label: 'Debt Issuance/Repayment', key: 'netDebtIssuance' },
  { label: 'Stock Issuance', key: 'commonStockIssuance' },
  { label: 'Stock Repurchases', key: 'commonStockRepurchased' },
  { label: 'Dividends Paid', key: 'commonDividendsPaid' },
  { label: 'Other Financing', key: 'otherFinancingActivities' },
  { label: 'Financing Cash Flow', key: 'netCashProvidedByFinancingActivities' },
  { label: '', isHeader: true },
  { label: 'Net Change in Cash', key: 'netChangeInCash' },
  { label: 'Free Cash Flow', key: 'freeCashFlow' },
];

export function Financials({ onSymbolChange, initialSymbol }: FinancialsProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'TSLA');
  const [statementType, setStatementType] = useState<StatementType>('income');
  const [periodType, setPeriodType] = useState<PeriodType>('quarter');
  const [openCharts, setOpenCharts] = useState<ChartWindow[]>([]);

  const { data: incomeData, loading: incomeLoading } = useIncomeStatement(symbol, periodType, 40);
  const { data: balanceData, loading: balanceLoading } = useBalanceSheet(symbol, periodType, 40);
  const { data: cashFlowData, loading: cashFlowLoading } = useCashFlow(symbol, periodType, 40);

  const handleTickerSelect = (newSymbol: string) => {
    setSymbol(newSymbol);
  };

  // Update symbol when initialSymbol changes from parent
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Notify parent of symbol changes for header content
  useEffect(() => {
    if (onSymbolChange) {
      onSymbolChange(
        symbol,
        <InlineTickerInput value={symbol} onSelect={handleTickerSelect} />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Open a chart window for a metric
  const openChart = (row: RowConfig) => {
    const id = `${symbol}-${row.label}-${Date.now()}`;
    // Check if already open
    if (openCharts.some(c => c.label === row.label)) {
      return;
    }
    setOpenCharts(prev => [...prev, {
      id,
      label: row.label,
      key: row.key,
      compute: row.compute,
      isMargin: row.isMargin,
    }]);
  };

  // Close a chart window
  const closeChart = (id: string) => {
    setOpenCharts(prev => prev.filter(c => c.id !== id));
  };

  // Get chart data for a metric
  const getChartData = (chart: ChartWindow) => {
    const data = sortedData.map((item, idx) => {
      let value: number;
      if (chart.compute) {
        const prevItem = idx > 0 ? sortedData[idx - 1] : undefined;
        value = chart.compute(
          item as unknown as Record<string, number>,
          prevItem as unknown as Record<string, number> | undefined
        ) || 0;
      } else if (chart.key) {
        value = (item as unknown as Record<string, number>)[chart.key] || 0;
      } else {
        value = 0;
      }
      return {
        period: getPeriodLabel(item, periodType === 'quarter'),
        value,
      };
    });
    return data;
  };

  // Get current data and rows based on statement type
  let currentData: (IncomeStatement | BalanceSheet | CashFlowStatement)[] = [];
  let currentRows: RowConfig[] = [];
  let loading = false;

  switch (statementType) {
    case 'income':
      currentData = incomeData;
      currentRows = incomeRows;
      loading = incomeLoading;
      break;
    case 'balance':
      currentData = balanceData;
      currentRows = balanceRows;
      loading = balanceLoading;
      break;
    case 'cashflow':
      currentData = cashFlowData;
      currentRows = cashFlowRows;
      loading = cashFlowLoading;
      break;
  }

  // Reverse to show oldest first (left to right)
  const sortedData = [...currentData].reverse();

  return (
    <div className="flex flex-col h-full">
      {/* Statement Type Tabs */}
      <div className="flex items-center gap-3 px-2 py-1 border-b border-border">
        <button
          onClick={() => setStatementType('balance')}
          className={`text-xs ${statementType === 'balance' ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Balance
        </button>
        <button
          onClick={() => setStatementType('income')}
          className={`text-xs ${statementType === 'income' ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Income
        </button>
        <button
          onClick={() => setStatementType('cashflow')}
          className={`text-xs ${statementType === 'cashflow' ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Cash Flow
        </button>

        <div className="mx-1 h-3 border-l border-border" />

        <button
          onClick={() => setPeriodType('quarter')}
          className={`text-xs ${periodType === 'quarter' ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Qtr
        </button>
        <button
          onClick={() => setPeriodType('annual')}
          className={`text-xs ${periodType === 'annual' ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Yr
        </button>

        <span className="text-text-secondary text-[10px] ml-auto">In Millions</span>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            No data available for {symbol}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-secondary z-10">
              <tr className="border-b border-border">
                <th className="text-left font-normal text-text-primary px-2 py-1 min-w-[150px] sticky left-0 bg-bg-secondary">

                </th>
                {sortedData.map((item, idx) => (
                  <th
                    key={idx}
                    className="text-right font-normal text-text-primary px-2 py-1 min-w-[70px]"
                  >
                    {getPeriodLabel(item, periodType === 'quarter')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, rowIdx) => {
                if (row.isHeader) {
                  return (
                    <tr key={rowIdx} className="border-b border-border/30">
                      <td
                        colSpan={sortedData.length + 1}
                        className="text-text-primary font-semibold px-2 py-1 bg-bg-tertiary/30 text-xs"
                      >
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={rowIdx} className="border-b border-border/30 hover:bg-bg-tertiary/30">
                    <td className="text-text-primary px-2 py-0.5 sticky left-0 bg-bg-secondary">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openChart(row)}
                          className="w-3.5 h-3.5 rounded bg-accent-blue hover:bg-accent-blue/80 text-white flex items-center justify-center"
                          title={`Chart ${row.label}`}
                        >
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="1,8 3,5 5,6 7,2 9,4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <span>{row.label}</span>
                      </div>
                    </td>
                    {sortedData.map((item, colIdx) => {
                      let value: string;

                      if (row.compute) {
                        const prevItem = colIdx > 0 ? sortedData[colIdx - 1] : undefined;
                        const computed = row.compute(
                          item as unknown as Record<string, number>,
                          prevItem as unknown as Record<string, number> | undefined
                        );
                        value = formatPercent(computed);
                      } else if (row.key) {
                        const rawValue = (item as unknown as Record<string, number>)[row.key];
                        value = formatMillions(rawValue);
                      } else {
                        value = '-';
                      }

                      return (
                        <td
                          key={colIdx}
                          className={`text-right px-2 py-0.5 font-mono ${
                            row.isMargin ? 'text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Chart Windows - rendered via portal to allow free movement */}
      {openCharts.map((chart, idx) =>
        createPortal(
          <div
            key={chart.id}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <DraggableWindow
              title={`${symbol} - ${chart.label}`}
              defaultWidth={700}
              defaultHeight={400}
              defaultX={150 + idx * 30}
              defaultY={150 + idx * 30}
              minWidth={400}
              minHeight={250}
              zIndex={200 + idx}
              onClose={() => closeChart(chart.id)}
            >
              <MetricChart
                symbol={symbol}
                metricLabel={chart.label}
                data={getChartData(chart)}
                isPercentage={chart.isMargin}
              />
            </DraggableWindow>
          </div>,
          document.body
        )
      )}
    </div>
  );
}
