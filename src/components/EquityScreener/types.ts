import type { ScreenerParams } from '../../types/fmp';
import type { ClientFilters } from '../../hooks/useScreener';

// Filter tab type
export type FilterTab = 'descriptive' | 'valuation' | 'profitability' | 'financial' | 'technical';

// Combined filter state
export interface ScreenerFilterState {
  server: ScreenerParams;
  client: ClientFilters;
}

// Active filter for display
export interface ActiveFilter {
  id: string;
  category: FilterTab;
  label: string;
  value: string;
}

// Filter option for dropdowns
export interface FilterOption {
  value: string;
  label: string;
}

// Range filter config
export interface RangeFilterConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  serverMinKey?: keyof ScreenerParams;
  serverMaxKey?: keyof ScreenerParams;
  clientMinKey?: keyof ClientFilters;
  clientMaxKey?: keyof ClientFilters;
}

// Select filter config
export interface SelectFilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  serverKey?: keyof ScreenerParams;
  clientKey?: keyof ClientFilters;
  multiple?: boolean;
}

// Sector options for dropdown
export const SECTOR_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any Sector' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Consumer Cyclical', label: 'Consumer Cyclical' },
  { value: 'Consumer Defensive', label: 'Consumer Defensive' },
  { value: 'Industrials', label: 'Industrials' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Basic Materials', label: 'Basic Materials' },
  { value: 'Communication Services', label: 'Communication Services' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Utilities', label: 'Utilities' },
];

// Exchange options for dropdown
export const EXCHANGE_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any Exchange' },
  { value: 'NYSE', label: 'NYSE' },
  { value: 'NASDAQ', label: 'NASDAQ' },
  { value: 'AMEX', label: 'AMEX' },
];

// Country options for dropdown
export const COUNTRY_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any Country' },
  { value: 'US', label: 'United States' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'CA', label: 'Canada' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
];

// Default filter state
export const DEFAULT_FILTER_STATE: ScreenerFilterState = {
  server: {
    isActivelyTrading: true,
    limit: 500,
  },
  client: {},
};
