import { useState, useRef, useEffect } from 'react';
import { useTickerSearch } from '../../hooks/useTickerSearch';

interface SymbolInputProps {
  label: string;
  labelColor: string;
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
}

export function SymbolInput({ label, labelColor, value, onChange, disabled }: SymbolInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading } = useTickerSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery(symbol);
    onChange(symbol);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      onChange(query);
      setIsOpen(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">{label}:</span>
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: labelColor }}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Symbol"
          className="w-24 px-2 py-1 text-xs font-mono bg-bg-tertiary border border-border rounded
                     text-text-primary placeholder:text-text-secondary
                     focus:outline-none focus:border-accent-blue
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto
                        bg-bg-secondary border border-border rounded shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-xs text-text-secondary">Loading...</div>
          )}
          {results.slice(0, 10).map((result) => (
            <button
              key={`${result.symbol}-${result.exchangeShortName}`}
              onClick={() => handleSelect(result.symbol)}
              className="w-full px-3 py-2 text-left text-xs hover:bg-bg-tertiary
                         flex items-center justify-between gap-2"
            >
              <span className="font-mono text-text-primary font-medium">
                {result.symbol}
              </span>
              <span className="text-text-secondary truncate flex-1">
                {result.name}
              </span>
              <span className="text-[10px] text-text-secondary">
                {result.exchangeShortName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
