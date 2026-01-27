import { useState, useRef, useEffect } from 'react';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { SearchResult } from '../../types/fmp';

interface InlineTickerInputProps {
  value: string;
  onSelect: (symbol: string) => void;
}

export function InlineTickerInput({ value, onSelect }: InlineTickerInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { results, loading } = useTickerSearch(isEditing ? query : '', 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update query when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setQuery(value);
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setQuery(value);
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, value]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value.toUpperCase());
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.symbol);
    setIsEditing(false);
    onSelect(result.symbol);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setQuery(value);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[highlightedIndex]) {
        handleSelect(results[highlightedIndex]);
      } else if (query) {
        setIsEditing(false);
        onSelect(query);
      }
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleBlur = () => {
    // Small delay to allow click on dropdown
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsEditing(false);
        setQuery(value);
      }
    }, 150);
  };

  if (!isEditing) {
    return (
      <button
        onClick={handleClick}
        className="text-text-primary font-semibold text-xs hover:text-accent-blue transition-colors cursor-text"
        title="Click to change ticker"
      >
        {value}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="bg-bg-tertiary border border-accent-blue rounded px-1.5 py-px text-text-primary font-semibold text-xs w-16 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="ml-1 w-2.5 h-2.5 border border-text-secondary border-t-accent-blue rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 mt-1 w-64 bg-bg-secondary border border-border rounded shadow-lg max-h-48 overflow-y-auto"
        >
          {results.map((result, index) => (
            <button
              key={`${result.symbol}-${result.exchangeShortName}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-2 py-1 text-left flex items-center justify-between hover:bg-bg-tertiary transition-colors text-xs ${
                index === highlightedIndex ? 'bg-bg-tertiary' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary font-mono font-semibold min-w-[50px]">
                  {result.symbol}
                </span>
                <span className="text-text-secondary truncate max-w-[120px]">
                  {result.name}
                </span>
              </div>
              <span className="text-text-secondary text-[10px] bg-bg-tertiary px-1 py-px rounded">
                {result.exchangeShortName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
