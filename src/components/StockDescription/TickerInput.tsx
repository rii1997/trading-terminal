import { useState, useRef, useEffect } from 'react';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { SearchResult } from '../../types/fmp';

interface TickerInputProps {
  onSelect: (symbol: string) => void;
  initialValue?: string;
}

export function TickerInput({ onSelect, initialValue = '' }: TickerInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { results, loading } = useTickerSearch(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setQuery(value);
    setIsOpen(true);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.symbol);
    setIsOpen(false);
    onSelect(result.symbol);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query) {
        onSelect(query);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      onSelect(query);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setIsOpen(true)}
              placeholder="Enter ticker symbol..."
              className="w-full bg-bg-tertiary border border-border rounded px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-blue font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Go
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border rounded shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={`${result.symbol}-${result.exchangeShortName}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-bg-tertiary transition-colors ${
                index === highlightedIndex ? 'bg-bg-tertiary' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-text-primary font-mono font-semibold min-w-[60px]">
                  {result.symbol}
                </span>
                <span className="text-text-secondary text-sm truncate max-w-[300px]">
                  {result.name}
                </span>
              </div>
              <span className="text-text-secondary text-xs bg-bg-tertiary px-2 py-0.5 rounded">
                {result.exchangeShortName}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query && !loading && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border rounded shadow-lg px-3 py-2"
        >
          <p className="text-text-secondary text-sm">
            No results found. Press Enter to search for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
