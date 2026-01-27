// Rate limit helper - adds delay between API calls
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Default delay between FMP API calls (150ms)
export const API_DELAY = 150;
