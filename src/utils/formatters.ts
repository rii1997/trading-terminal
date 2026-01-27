// Format large numbers with suffixes (1.2B, 500M, etc.)
export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '-';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1e12) {
    return sign + (absNum / 1e12).toFixed(2) + 'T';
  }
  if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(2) + 'B';
  }
  if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(2) + 'M';
  }
  if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(2) + 'K';
  }
  return sign + absNum.toFixed(2);
}

// Format currency values
export function formatCurrency(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return '$' + num.toFixed(decimals);
}

// Format percentage values
export function formatPercent(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(decimals) + '%';
}

// Format ratio values (2 decimal places)
export function formatRatio(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return num.toFixed(decimals);
}

// Format date string to MM/DD/YY
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
}

// Format time from timestamp
export function formatTime(timestamp: number | null | undefined): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// Format volume (19.4M, etc.)
export function formatVolume(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '-';

  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}
