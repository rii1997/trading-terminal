import { useState, useEffect, useCallback } from 'react';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  valueMin?: number;
  valueMax?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  format?: (value: number) => string;
  disabled?: boolean;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  format = (v) => v.toString(),
  disabled = false,
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState<string>(valueMin?.toString() ?? '');
  const [localMax, setLocalMax] = useState<string>(valueMax?.toString() ?? '');

  useEffect(() => {
    setLocalMin(valueMin?.toString() ?? '');
  }, [valueMin]);

  useEffect(() => {
    setLocalMax(valueMax?.toString() ?? '');
  }, [valueMax]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMin(val);
  }, []);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMax(val);
  }, []);

  const handleBlur = useCallback(() => {
    const parsedMin = localMin === '' ? undefined : parseFloat(localMin);
    const parsedMax = localMax === '' ? undefined : parseFloat(localMax);
    onChange(parsedMin, parsedMax);
  }, [localMin, localMax, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          placeholder={format(min)}
          value={localMin}
          onChange={handleMinChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className="w-20 px-2 py-1 text-xs bg-bg-primary border border-border rounded
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:border-accent-blue
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-text-secondary text-xs">-</span>
        <input
          type="number"
          placeholder={format(max)}
          value={localMax}
          onChange={handleMaxChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className="w-20 px-2 py-1 text-xs bg-bg-primary border border-border rounded
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:border-accent-blue
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
