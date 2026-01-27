import { useCallback } from 'react';
import type { FilterOption } from './types';

interface SelectFilterProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectFilter({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SelectFilterProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="px-2 py-1 text-xs bg-bg-primary border border-border rounded
                   text-text-primary
                   focus:outline-none focus:border-accent-blue
                   disabled:opacity-50 disabled:cursor-not-allowed
                   appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 4px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          paddingRight: '24px',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleFilterProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  disabled?: boolean;
}

export function ToggleFilter({
  label,
  value,
  onChange,
  disabled = false,
}: ToggleFilterProps) {
  const handleChange = useCallback(() => {
    // Cycle through: undefined -> true -> false -> undefined
    if (value === undefined) {
      onChange(true);
    } else if (value === true) {
      onChange(false);
    } else {
      onChange(undefined);
    }
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleChange}
        disabled={disabled}
        className={`
          w-8 h-4 rounded-full relative transition-colors
          ${value === true ? 'bg-accent-green' : value === false ? 'bg-accent-red' : 'bg-bg-tertiary'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform
            ${value === true ? 'translate-x-4' : value === false ? 'translate-x-0.5' : 'translate-x-2'}
          `}
        />
      </button>
      <span className="text-xs text-text-secondary">
        {label}
        {value !== undefined && (
          <span className={value ? 'text-accent-green' : 'text-accent-red'}>
            {' '}({value ? 'Yes' : 'No'})
          </span>
        )}
      </span>
    </div>
  );
}

interface SmaFilterProps {
  label: string;
  direction: 'above' | 'below' | undefined;
  percent: number | undefined;
  onDirectionChange: (value: 'above' | 'below' | undefined) => void;
  onPercentChange: (value: number | undefined) => void;
  disabled?: boolean;
}

export function SmaFilter({
  label,
  direction,
  percent,
  onDirectionChange,
  onPercentChange,
  disabled = false,
}: SmaFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="flex items-center gap-1">
        <select
          value={direction || ''}
          onChange={(e) => onDirectionChange(e.target.value as 'above' | 'below' | undefined || undefined)}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-bg-primary border border-border rounded
                     text-text-primary focus:outline-none focus:border-accent-blue
                     disabled:opacity-50 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 4px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px',
            paddingRight: '24px',
          }}
        >
          <option value="">Any</option>
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        {direction && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-secondary">by</span>
            <input
              type="number"
              value={percent ?? ''}
              onChange={(e) => onPercentChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0"
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className="w-14 px-2 py-1 text-xs bg-bg-primary border border-border rounded
                         text-text-primary focus:outline-none focus:border-accent-blue
                         disabled:opacity-50"
            />
            <span className="text-xs text-text-secondary">%</span>
          </div>
        )}
      </div>
    </div>
  );
}
