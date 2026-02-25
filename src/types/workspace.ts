export type WidgetType =
  | 'description'
  | 'financials'
  | 'news'
  | 'worldIndex'
  | 'commodities'
  | 'screener'
  | 'compare'
  | 'ratios'
  | 'earnings'
  | 'dividends'
  | 'earningsMatrix'
  | 'insiderTrades'
  | 'congressTrades'
  | 'earningsCalendar'
  | 'ipoCalendar'
  | 'splitCalendar'
  | 'dividendCalendar'
  | 'sectorPerformance'
  | 'marketMovers'
  | 'indexHoldings'
  | 'economicCalendar'
  | 'pressReleases'
  | 'analystRatings'
  | 'secFilings';

export interface WidgetConfig {
  symbol?: string;
  [key: string]: unknown;
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: WidgetConfig;
}

export interface Board {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: number;
}

export interface Workspace {
  boards: Board[];
  activeBoardId: string;
}

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  category: 'analysis' | 'market' | 'calendar' | 'trading' | 'research';
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Analysis
  { type: 'description', label: 'Stock Description', category: 'analysis', defaultSize: { width: 680, height: 520 }, minSize: { width: 500, height: 350 } },
  { type: 'financials', label: 'Financials', category: 'analysis', defaultSize: { width: 750, height: 380 }, minSize: { width: 600, height: 300 } },
  { type: 'ratios', label: 'Ratios', category: 'analysis', defaultSize: { width: 880, height: 600 }, minSize: { width: 700, height: 400 } },
  { type: 'earnings', label: 'Earnings', category: 'analysis', defaultSize: { width: 720, height: 600 }, minSize: { width: 600, height: 400 } },
  { type: 'dividends', label: 'Dividends', category: 'analysis', defaultSize: { width: 780, height: 550 }, minSize: { width: 650, height: 400 } },
  { type: 'earningsMatrix', label: 'Earnings Matrix', category: 'analysis', defaultSize: { width: 950, height: 550 }, minSize: { width: 800, height: 450 } },
  { type: 'compare', label: 'Compare', category: 'analysis', defaultSize: { width: 900, height: 600 }, minSize: { width: 700, height: 450 } },
  { type: 'analystRatings', label: 'Analyst Ratings', category: 'analysis', defaultSize: { width: 700, height: 550 }, minSize: { width: 550, height: 400 } },

  // Market
  { type: 'worldIndex', label: 'World Index', category: 'market', defaultSize: { width: 580, height: 400 }, minSize: { width: 450, height: 250 } },
  { type: 'commodities', label: 'Commodities', category: 'market', defaultSize: { width: 520, height: 420 }, minSize: { width: 400, height: 250 } },
  { type: 'sectorPerformance', label: 'Sector Performance', category: 'market', defaultSize: { width: 650, height: 520 }, minSize: { width: 550, height: 400 } },
  { type: 'marketMovers', label: 'Market Movers', category: 'market', defaultSize: { width: 800, height: 550 }, minSize: { width: 650, height: 400 } },
  { type: 'indexHoldings', label: 'Index Holdings', category: 'market', defaultSize: { width: 850, height: 600 }, minSize: { width: 700, height: 450 } },

  // Calendar
  { type: 'earningsCalendar', label: 'Earnings Calendar', category: 'calendar', defaultSize: { width: 900, height: 500 }, minSize: { width: 750, height: 400 } },
  { type: 'ipoCalendar', label: 'IPO Calendar', category: 'calendar', defaultSize: { width: 850, height: 550 }, minSize: { width: 700, height: 400 } },
  { type: 'splitCalendar', label: 'Split Calendar', category: 'calendar', defaultSize: { width: 750, height: 500 }, minSize: { width: 600, height: 400 } },
  { type: 'dividendCalendar', label: 'Dividend Calendar', category: 'calendar', defaultSize: { width: 900, height: 550 }, minSize: { width: 750, height: 400 } },
  { type: 'economicCalendar', label: 'Economic Calendar', category: 'calendar', defaultSize: { width: 800, height: 600 }, minSize: { width: 650, height: 450 } },

  // Trading
  { type: 'insiderTrades', label: 'Insider Trades', category: 'trading', defaultSize: { width: 750, height: 550 }, minSize: { width: 600, height: 400 } },
  { type: 'congressTrades', label: 'Congress Trades', category: 'trading', defaultSize: { width: 800, height: 550 }, minSize: { width: 650, height: 400 } },
  { type: 'screener', label: 'Equity Screener', category: 'trading', defaultSize: { width: 1100, height: 650 }, minSize: { width: 900, height: 500 } },

  // Research
  { type: 'news', label: 'News', category: 'research', defaultSize: { width: 700, height: 320 }, minSize: { width: 500, height: 200 } },
  { type: 'pressReleases', label: 'Press Releases', category: 'research', defaultSize: { width: 700, height: 600 }, minSize: { width: 550, height: 400 } },
  { type: 'secFilings', label: 'SEC Filings', category: 'research', defaultSize: { width: 750, height: 550 }, minSize: { width: 600, height: 400 } },
];

export const WIDGET_CATEGORIES = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'market', label: 'Market Data' },
  { id: 'calendar', label: 'Calendars' },
  { id: 'trading', label: 'Trading' },
  { id: 'research', label: 'Research' },
] as const;
