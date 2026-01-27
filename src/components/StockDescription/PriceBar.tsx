import type { Quote } from '../../types/fmp';
import { formatCurrency, formatPercent, formatVolume, formatTime } from '../../utils/formatters';

interface PriceBarProps {
  symbol: string;
  quote: Quote | null;
}

export function PriceBar({ symbol, quote }: PriceBarProps) {
  if (!quote) return null;

  const isPositive = quote.change >= 0;

  return (
    <div className="bg-bg-tertiary border-b border-border px-2 py-0.5 flex items-center gap-3 text-xs font-mono">
      <span className="text-text-primary font-semibold">{symbol}</span>

      <span className={isPositive ? 'text-accent-green' : 'text-accent-red'}>
        {isPositive ? '▲' : '▼'}
      </span>

      <span className={`font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
        {formatCurrency(quote.price)}
      </span>

      <span className={isPositive ? 'text-accent-green' : 'text-accent-red'}>
        {isPositive ? '+' : ''}{quote.change?.toFixed(2)} {formatPercent(quote.changesPercentage)}
      </span>

      <span className="text-text-secondary">
        Vol <span className="text-text-primary">{formatVolume(quote.volume)}</span>
      </span>

      <span className="text-text-secondary">
        {quote.dayLow?.toFixed(2)}/{quote.dayHigh?.toFixed(2)}
      </span>

      <span className="text-text-secondary ml-auto">
        {formatTime(quote.timestamp)}
      </span>
    </div>
  );
}
