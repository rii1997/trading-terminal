import { useCallback } from 'react';
import type { FilterTab } from './types';

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  resultCount: number;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'descriptive', label: 'Descriptive' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'profitability', label: 'Profitability' },
  { id: 'financial', label: 'Financial Health' },
  { id: 'technical', label: 'Technical' },
];

export function FilterTabs({ activeTab, onTabChange, resultCount }: FilterTabsProps) {
  const handleTabClick = useCallback((tab: FilterTab) => {
    onTabChange(tab);
  }, [onTabChange]);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-secondary">
      <div className="flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              px-3 py-1 text-xs rounded transition-colors
              ${activeTab === tab.id
                ? 'bg-accent-blue text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-primary'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-text-secondary">
        Results: <span className="text-text-primary font-medium">{resultCount.toLocaleString()}</span> matches
      </div>
    </div>
  );
}
