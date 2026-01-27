import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';

interface SECFilingsProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  size: number;
  isXBRL: number;
  isInlineXBRL: number;
  primaryDocument: string;
  primaryDocDescription: string;
}

interface SECSubmissions {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  description: string;
  website: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      acceptanceDateTime: string[];
      form: string[];
      fileNumber: string[];
      filmNumber: string[];
      items: string[];
      size: number[];
      isXBRL: number[];
      isInlineXBRL: number[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

// Form type colors
const getFormColor = (form: string): string => {
  if (form === '10-K' || form === '10-K/A') return 'text-accent-green';
  if (form === '10-Q' || form === '10-Q/A') return 'text-accent-blue';
  if (form === '8-K' || form === '8-K/A') return 'text-accent-orange';
  if (form.includes('DEF 14A') || form.includes('PROXY')) return 'text-accent-purple';
  if (form.includes('4') || form.includes('3') || form.includes('5')) return 'text-accent-yellow';
  if (form.includes('S-') || form.includes('424')) return 'text-accent-cyan';
  return 'text-text-primary';
};

const getFormBgColor = (form: string): string => {
  if (form === '10-K' || form === '10-K/A') return 'bg-accent-green/20';
  if (form === '10-Q' || form === '10-Q/A') return 'bg-accent-blue/20';
  if (form === '8-K' || form === '8-K/A') return 'bg-accent-orange/20';
  if (form.includes('DEF 14A') || form.includes('PROXY')) return 'bg-accent-purple/20';
  if (form.includes('4') || form.includes('3') || form.includes('5')) return 'bg-accent-yellow/20';
  if (form.includes('S-') || form.includes('424')) return 'bg-accent-cyan/20';
  return 'bg-bg-tertiary';
};

// Form type descriptions
const getFormDescription = (form: string): string => {
  const descriptions: Record<string, string> = {
    '10-K': 'Annual Report',
    '10-K/A': 'Annual Report Amendment',
    '10-Q': 'Quarterly Report',
    '10-Q/A': 'Quarterly Report Amendment',
    '8-K': 'Current Report',
    '8-K/A': 'Current Report Amendment',
    'DEF 14A': 'Definitive Proxy Statement',
    '4': 'Insider Trading',
    '3': 'Initial Beneficial Ownership',
    '5': 'Annual Beneficial Ownership',
    'S-1': 'Registration Statement',
    'S-1/A': 'Registration Amendment',
    '424B4': 'Prospectus',
    '13F-HR': 'Institutional Holdings',
    'SC 13G': 'Beneficial Ownership',
    'SC 13D': 'Beneficial Ownership',
  };
  return descriptions[form] || form;
};

// Format date
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format file size
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Convert SEC EDGAR submissions to filings array
const parseSubmissions = (data: SECSubmissions): SECFiling[] => {
  const recent = data.filings.recent;
  const filings: SECFiling[] = [];

  for (let i = 0; i < recent.accessionNumber.length; i++) {
    filings.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      acceptanceDateTime: recent.acceptanceDateTime[i],
      form: recent.form[i],
      fileNumber: recent.fileNumber[i],
      filmNumber: recent.filmNumber[i],
      items: recent.items[i],
      size: recent.size[i],
      isXBRL: recent.isXBRL[i],
      isInlineXBRL: recent.isInlineXBRL[i],
      primaryDocument: recent.primaryDocument[i],
      primaryDocDescription: recent.primaryDocDescription[i],
    });
  }

  return filings;
};

// Build SEC EDGAR document URL
const getFilingUrl = (cik: string, accessionNumber: string, primaryDocument: string): string => {
  const cleanAccession = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${cik}/${cleanAccession}/${primaryDocument}`;
};

// Form type filter options
const FORM_FILTERS = [
  { value: 'all', label: 'All Filings' },
  { value: '10-K', label: '10-K (Annual)' },
  { value: '10-Q', label: '10-Q (Quarterly)' },
  { value: '8-K', label: '8-K (Current)' },
  { value: 'DEF', label: 'Proxy' },
  { value: '4', label: 'Insider' },
  { value: 'S-', label: 'Registration' },
];

export function SECFilings({ onSymbolChange, initialSymbol }: SECFilingsProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [cik, setCik] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [filings, setFilings] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formFilter, setFormFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results: searchResults, loading: searchLoading } = useTickerSearch(query, 300);

  // Fetch CIK from company profile
  const fetchCik = useCallback(async (sym: string): Promise<string | null> => {
    try {
      const profile = await fmp.profile(sym);
      if (profile && profile.length > 0 && profile[0].cik) {
        return profile[0].cik;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch CIK:', err);
      return null;
    }
  }, []);

  // Fetch SEC filings
  const fetchFilings = useCallback(async (companyCik: string) => {
    try {
      // Pad CIK to 10 digits
      const paddedCik = companyCik.padStart(10, '0');
      const response = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, {
        headers: {
          'User-Agent': 'Trading Terminal (contact@example.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`SEC API error: ${response.status}`);
      }

      const data: SECSubmissions = await response.json();
      setCompanyName(data.name);
      const parsedFilings = parseSubmissions(data);
      setFilings(parsedFilings);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch SEC filings:', err);
      setError('Failed to load SEC filings');
      setFilings([]);
    }
  }, []);

  // Load data on symbol change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const companyCik = await fetchCik(symbol);
      if (companyCik) {
        setCik(companyCik);
        await fetchFilings(companyCik);
      } else {
        setError(`Could not find CIK for ${symbol}`);
        setFilings([]);
      }

      setLoading(false);
    };

    loadData();
  }, [symbol, fetchCik, fetchFilings]);

  // Update when initialSymbol changes
  useEffect(() => {
    if (initialSymbol && initialSymbol !== symbol) {
      setSymbol(initialSymbol);
      setQuery(initialSymbol);
    }
  }, [initialSymbol, symbol]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.toUpperCase());
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                setSymbol(query);
                setShowDropdown(false);
              }
            }}
            className="w-20 px-2 py-0.5 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
            placeholder="Symbol"
          />
        </div>
      );
      onSymbolChange(symbol, headerContent);
    }
  }, [symbol, query, onSymbolChange]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSymbol = (sym: string) => {
    setSymbol(sym);
    setQuery(sym);
    setShowDropdown(false);
  };

  // Filter filings by form type
  const filteredFilings = filings.filter(filing => {
    if (formFilter === 'all') return true;
    return filing.form.includes(formFilter);
  });

  // Group filings by year for summary
  const filingsByYear = filings.reduce((acc, filing) => {
    const year = new Date(filing.filingDate).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const years = Object.keys(filingsByYear).map(Number).sort((a, b) => b - a).slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Search Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-12 left-2 z-50 w-64 bg-bg-secondary border border-border rounded shadow-lg max-h-48 overflow-y-auto"
        >
          {searchLoading ? (
            <div className="p-2 text-xs text-text-secondary">Searching...</div>
          ) : (
            searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleSelectSymbol(result.symbol)}
                className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary flex justify-between items-center"
              >
                <span className="text-xs font-medium">{result.symbol}</span>
                <span className="text-[10px] text-text-secondary truncate ml-2">{result.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Summary Header */}
      <div className="flex-shrink-0 p-3 border-b border-border bg-bg-secondary">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-secondary mb-0.5">COMPANY</div>
            <div className="text-lg font-bold">{companyName || symbol}</div>
            {cik && (
              <div className="text-[10px] text-text-secondary">CIK: {cik}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-secondary mb-0.5">TOTAL FILINGS</div>
            <div className="text-xl font-bold">{filings.length}</div>
          </div>
        </div>

        {/* Year summary */}
        {years.length > 0 && (
          <div className="mt-2 flex gap-3">
            {years.map(year => (
              <div key={year} className="text-center">
                <div className="text-[10px] text-text-secondary">{year}</div>
                <div className="text-sm font-medium">{filingsByYear[year]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-border flex items-center gap-2">
        <span className="text-[10px] text-text-secondary">FILTER:</span>
        <div className="flex gap-1">
          {FORM_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setFormFilter(filter.value)}
              className={`px-2 py-0.5 text-[10px] rounded ${
                formFilter === filter.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-text-secondary">
          Showing {filteredFilings.length} of {filings.length}
        </span>
      </div>

      {/* Filings Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-accent-red">
            {error}
          </div>
        ) : filteredFilings.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-text-secondary">
            No filings found for {symbol}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left font-medium px-3 py-2">Date</th>
                <th className="text-left font-medium px-3 py-2">Form</th>
                <th className="text-left font-medium px-3 py-2">Description</th>
                <th className="text-right font-medium px-3 py-2">Size</th>
              </tr>
            </thead>
            <tbody>
              {filteredFilings.slice(0, 100).map((filing, idx) => (
                <tr
                  key={`${filing.accessionNumber}-${idx}`}
                  className="border-b border-border/50 hover:bg-bg-secondary cursor-pointer"
                  onClick={() => {
                    if (cik) {
                      window.open(getFilingUrl(cik, filing.accessionNumber, filing.primaryDocument), '_blank');
                    }
                  }}
                >
                  <td className="px-3 py-2 text-text-secondary font-mono">
                    {formatDate(filing.filingDate)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(filing.form)} ${getFormBgColor(filing.form)}`}>
                      {filing.form}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-text-primary">
                    <div className="font-medium">{getFormDescription(filing.form)}</div>
                    {filing.primaryDocDescription && filing.primaryDocDescription !== filing.form && (
                      <div className="text-[10px] text-text-secondary truncate max-w-xs">
                        {filing.primaryDocDescription}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-text-secondary font-mono">
                    {formatSize(filing.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <span>Data from SEC EDGAR</span>
        <a
          href={cik ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=include&count=40` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-blue hover:underline"
        >
          View on SEC.gov
        </a>
      </div>
    </div>
  );
}
