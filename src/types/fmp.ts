// Company Profile from /api/v3/profile/{symbol}
export interface CompanyProfile {
  symbol: string;
  companyName: string;
  cik: string;
  description: string;
  image: string;
  website: string;
  ceo: string;
  sector: string;
  industry: string;
  exchange: string;
  exchangeShortName: string;
  currency: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  fullTimeEmployees: string;
  ipoDate: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
  mktCap: number;
  price: number;
  volAvg: number;
  beta: number;
  lastDiv: number;
  range: string;
  changes: number;
  dcfDiff: number;
  dcf: number;
}

// Quote from /api/v3/quote/{symbol}
export interface Quote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

// Search result from /api/v3/search
export interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

// Key Metrics from /api/v3/key-metrics/{symbol}
export interface KeyMetrics {
  symbol: string;
  date: string;
  calendarYear: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  evToEBITDA: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
}

// Ratios from /api/v3/ratios/{symbol}
export interface Ratios {
  symbol: string;
  date: string;
  calendarYear: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  dividendPayoutRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceToEarningsRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
}

// Analyst Rating/Grade from /api/v3/grade/{symbol}
export interface AnalystGrade {
  symbol: string;
  date: string;
  gradingCompany: string;
  previousGrade: string;
  newGrade: string;
}

// Analyst Estimates from /stable/analyst-estimates
export interface AnalystEstimate {
  symbol: string;
  date: string;
  revenueLow: number;
  revenueHigh: number;
  revenueAvg: number;
  ebitdaLow: number;
  ebitdaHigh: number;
  ebitdaAvg: number;
  ebitLow: number;
  ebitHigh: number;
  ebitAvg: number;
  netIncomeLow: number;
  netIncomeHigh: number;
  netIncomeAvg: number;
  sgaExpenseLow: number;
  sgaExpenseHigh: number;
  sgaExpenseAvg: number;
  epsLow: number;
  epsHigh: number;
  epsAvg: number;
  numAnalystsRevenue: number;
  numAnalystsEps: number;
}

// Historical Price from /api/v3/historical-price-full/{symbol}
export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export interface HistoricalPriceResponse {
  symbol: string;
  historical: HistoricalPrice[];
}

// Stock News from /api/v3/stock_news
export interface StockNews {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

// Shares Float from /stable/shares-float
export interface SharesFloat {
  symbol: string;
  date: string;
  freeFloat: number;
  floatShares: number;
  outstandingShares: number;
  source: string;
}

// Dividend from /stable/dividends
export interface Dividend {
  symbol: string;
  date: string;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
  adjDividend: number;
  dividend: number;
  yield: number;
  frequency: string;
}

// Ratios TTM from /stable/ratios-ttm
export interface RatiosTTM {
  symbol: string;
  dividendYieldTTM: number | null;
  dividendPayoutRatioTTM: number | null;
  priceToEarningsRatioTTM: number | null;
  priceToBookRatioTTM: number | null;
  priceToSalesRatioTTM: number | null;
  enterpriseValueMultipleTTM: number | null;
}

// Income Statement from /stable/income-statement
export interface IncomeStatement {
  symbol: string;
  date: string;
  period: string;
  fiscalYear: string;
  reportedCurrency: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  operatingExpenses: number;
  operatingIncome: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  ebitda: number;
  ebit: number;
  depreciationAndAmortization: number;
  interestExpense: number;
  interestIncome: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
}

// Balance Sheet from /stable/balance-sheet-statement
export interface BalanceSheet {
  symbol: string;
  date: string;
  period: string;
  fiscalYear: string;
  reportedCurrency: string;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  accountsReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  longTermInvestments: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  accountPayables: number;
  shortTermDebt: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  commonStock: number;
  retainedEarnings: number;
  totalStockholdersEquity: number;
  totalEquity: number;
  totalLiabilitiesAndTotalEquity: number;
  totalDebt: number;
  netDebt: number;
}

// Cash Flow Statement from /stable/cash-flow-statement
export interface CashFlowStatement {
  symbol: string;
  date: string;
  period: string;
  fiscalYear: string;
  reportedCurrency: string;
  netIncome: number;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivities: number;
  netCashProvidedByInvestingActivities: number;
  netDebtIssuance: number;
  commonStockIssuance: number;
  commonStockRepurchased: number;
  commonDividendsPaid: number;
  otherFinancingActivities: number;
  netCashProvidedByFinancingActivities: number;
  effectOfForexChangesOnCash: number;
  netChangeInCash: number;
  cashAtBeginningOfPeriod: number;
  cashAtEndOfPeriod: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  operatingCashFlow: number;
}

// FMP Article/News from /stable/fmp-articles
export interface FmpArticle {
  title: string;
  date: string;
  content: string;
  tickers: string;
  image: string;
  link: string;
  author: string;
  site: string;
}

// Stock News from /stable/news/stock-latest or /stable/news/stock
export interface StockNewsItem {
  symbol: string | null;
  publishedDate: string;
  publisher: string;
  title: string;
  image: string | null;
  site: string;
  text: string;
  url: string;
}

// Index Quote (same structure as regular quote)
export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  previousClose: number;
  open: number;
  timestamp: number;
}

// Historical price (light version)
export interface HistoricalPriceLight {
  symbol: string;
  date: string;
  price: number;
  volume: number;
}

// ===== EQUITY SCREENER TYPES =====

// Parameters for /stable/company-screener (server-side filtering)
export interface ScreenerParams {
  sector?: string;
  industry?: string;
  country?: string;
  exchange?: string;
  marketCapMoreThan?: number;
  marketCapLowerThan?: number;
  priceMoreThan?: number;
  priceLowerThan?: number;
  volumeMoreThan?: number;
  volumeLowerThan?: number;
  betaMoreThan?: number;
  betaLowerThan?: number;
  dividendMoreThan?: number;
  dividendLowerThan?: number;
  isEtf?: boolean;
  isFund?: boolean;
  isActivelyTrading?: boolean;
  limit?: number;
}

// Result from /stable/company-screener
export interface ScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  exchangeShortName: string;
  country: string;
  isEtf: boolean;
  isFund: boolean;
  isActivelyTrading: boolean;
}

// Enriched stock with Quote data for client-side filtering
export interface EnrichedStock extends ScreenerResult {
  // From Quote (via batch-quote)
  change?: number;
  changesPercentage?: number;
  pe?: number;
  eps?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  yearHigh?: number;
  yearLow?: number;
  avgVolume?: number;
  dayHigh?: number;
  dayLow?: number;
  open?: number;
  previousClose?: number;

  // Calculated fields
  priceVsSma50?: number;  // price / priceAvg50 ratio
  priceVsSma200?: number; // price / priceAvg200 ratio
  nearYearHigh?: number;  // price / yearHigh ratio
  nearYearLow?: number;   // price / yearLow ratio

  // ===== From Ratios endpoint =====

  // Valuation Ratios
  priceToBookRatio?: number;
  priceToSalesRatio?: number;
  priceToFreeCashFlowsRatio?: number;
  priceEarningsToGrowthRatio?: number;  // PEG
  enterpriseValueMultiple?: number;     // EV/EBITDA
  dividendYield?: number;
  priceFairValue?: number;

  // Profitability Ratios
  grossProfitMargin?: number;
  operatingProfitMargin?: number;
  netProfitMargin?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  returnOnCapitalEmployed?: number;

  // Liquidity Ratios
  currentRatio?: number;
  quickRatio?: number;
  cashRatio?: number;

  // Debt/Leverage Ratios
  debtRatio?: number;
  debtEquityRatio?: number;
  interestCoverage?: number;
  cashFlowToDebtRatio?: number;

  // Efficiency Ratios
  assetTurnover?: number;
  inventoryTurnover?: number;
  receivablesTurnover?: number;
  daysOfSalesOutstanding?: number;
  cashConversionCycle?: number;

  // Per Share Data
  freeCashFlowPerShare?: number;
  cashPerShare?: number;
  payoutRatio?: number;

  // Sparkline data (lazy-loaded)
  sparklineData?: number[];
}

// Earnings Report (historical actual vs estimate) from /stable/earnings
export interface EarningsReport {
  symbol: string;
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

// Earnings Calendar Item from /stable/earnings-calendar
export interface EarningsCalendarItem {
  symbol: string;
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

// Insider Trade from /stable/insider-trading/search
export interface InsiderTrade {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingCik: string;
  companyCik: string;
  transactionType: string; // "P-Purchase", "S-Sale", etc.
  securitiesOwned: number;
  reportingName: string;
  typeOfOwner: string; // "director", "officer: CEO", etc.
  acquisitionOrDisposition: string; // "A" or "D"
  directOrIndirect: string; // "D" or "I"
  formType: string; // "3", "4", "5"
  securitiesTransacted: number;
  price: number;
  securityName: string;
  url: string;
}

// Insider Trade Statistics from /stable/insider-trading/statistics
export interface InsiderTradeStats {
  symbol: string;
  year: number;
  quarter: number;
  purchases: number;
  sales: number;
  buySellRatio: number;
  totalBought: number;
  totalSold: number;
  averageBought: number;
  averageSold: number;
}

// Congressional (House) Trade from /stable/house-trades
export interface CongressTrade {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  district: string;
  owner: string; // "Spouse", "Joint", etc.
  assetDescription: string;
  assetType: string; // "Stock", "Stock Option", etc.
  type: string; // "Purchase", "Sale"
  amount: string; // "$1,001 - $15,000", "$250,001 - $500,000", etc.
  capitalGainsOver200USD: string;
  comment: string;
  link: string;
}

// IPO Calendar Item from /stable/ipos-calendar
export interface IPOCalendarItem {
  symbol: string;
  date: string;
  daa: string; // Date as ISO string
  company: string;
  exchange: string;
  actions: string; // "Priced", "Expected", "Withdrawn", "Filed"
  shares: number | null;
  priceRange: string | null; // "10.00 - 12.00"
  marketCap: number | null;
}

// Stock Split Calendar Item from /stable/splits-calendar
export interface StockSplitCalendarItem {
  symbol: string;
  date: string;
  numerator: number;
  denominator: number;
  splitType: string; // "stock-split", "stock-dividend"
}

// Dividend Calendar Item from /stable/dividends-calendar
export interface DividendCalendarItem {
  symbol: string;
  date: string; // Ex-dividend date
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
  adjDividend: number;
  dividend: number;
  yield: number;
  frequency: string; // "Quarterly", "Monthly", "Annual", etc.
}

// Sector ETF mapping for sector performance
export interface SectorETF {
  symbol: string;
  name: string;
  sector: string;
}

// Sector Performance Data (calculated from ETF data)
export interface SectorPerformance {
  sector: string;
  etfSymbol: string;
  etfName: string;
  price: number;
  change1D: number;
  change1W: number;
  change1M: number;
  change3M: number;
  changeYTD: number;
  change1Y: number;
}

// Market Mover from /stable/biggest-gainers or /stable/biggest-losers
export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  exchange: string;
}

// Index Constituent from /stable/sp500-constituent, /stable/nasdaq-constituent, /stable/dowjones-constituent
export interface IndexConstituent {
  symbol: string;
  name: string;
  sector: string;
  subSector: string;
  headQuarter: string;
  dateFirstAdded: string | null;
  cik: string;
  founded: string;
}

// Economic Calendar Event from /stable/economic-calendar
export interface EconomicEvent {
  date: string;
  country: string;
  event: string;
  currency: string;
  previous: number | null;
  estimate: number | null;
  actual: number | null;
  change: number | null;
  impact: 'High' | 'Medium' | 'Low';
  changePercentage: number;
  unit: string | null;
}

// Company News Item (alias for StockNewsItem with better naming)
export interface CompanyNewsItem {
  symbol: string | null;
  publishedDate: string;
  publisher: string;
  title: string;
  image: string | null;
  site: string;
  text: string;
  url: string;
}

// DCF (Discounted Cash Flow) from /stable/discounted-cash-flow
export interface DCFValue {
  symbol: string;
  date: string;
  dcf: number;
  'Stock Price': number;
}

// Stock Peer from /stable/stock-peers
export interface StockPeer {
  symbol: string;
  companyName: string;
  price: number;
  mktCap: number;
}

// Key Executive from /stable/key-executives
export interface KeyExecutive {
  title: string;
  name: string;
  pay: number | null;
  currencyPay: string;
  gender: string;
  yearBorn: number | null;
  titleSince: string | null;
  active: boolean;
}

// Employee Count from /stable/employee-count
export interface EmployeeCount {
  symbol: string;
  cik: string;
  acceptanceTime: string;
  periodOfReport: string;
  companyName: string;
  formType: string;
  filingDate: string;
  employeeCount: number;
  source: string;
}

// Price Target Consensus from /stable/price-target-consensus
export interface PriceTargetConsensus {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetConsensus: number;
  targetMedian: number;
}
