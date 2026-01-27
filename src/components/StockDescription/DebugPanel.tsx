import { useState, useEffect } from 'react';
import { apiTracker, type ApiCallStats } from '../../utils/logger';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [calls, setCalls] = useState<ApiCallStats[]>([]);

  useEffect(() => {
    // Initial load
    setCalls(apiTracker.getCalls());

    // Subscribe to updates
    const unsubscribe = apiTracker.subscribe((newCalls) => {
      setCalls([...newCalls]);
    });

    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const formatDuration = (ms?: number) => {
    if (ms === undefined) return '-';
    return `${ms}ms`;
  };

  const formatDataAge = (seconds?: number) => {
    if (seconds === undefined) return '-';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-accent-green';
      case 'error': return 'text-accent-red';
      case 'pending': return 'text-accent-orange';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-bg-secondary border border-border rounded shadow-xl z-50 max-h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg-tertiary border-b border-border">
        <span className="text-text-primary text-sm font-semibold">API Debug Panel</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => apiTracker.clear()}
            className="text-text-secondary hover:text-text-primary text-xs"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="p-4 text-text-secondary text-sm text-center">
            No API calls yet
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-tertiary">
              <tr className="text-text-secondary">
                <th className="text-left px-2 py-1">Endpoint</th>
                <th className="text-left px-2 py-1">Symbol</th>
                <th className="text-right px-2 py-1">Time</th>
                <th className="text-right px-2 py-1">Age</th>
                <th className="text-center px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...calls].reverse().map((call, index) => (
                <tr
                  key={index}
                  className="border-b border-border/30 hover:bg-bg-tertiary/50"
                >
                  <td className="px-2 py-1 text-text-primary font-mono truncate max-w-[120px]">
                    {call.endpoint.replace('/stable', '')}
                  </td>
                  <td className="px-2 py-1 text-accent-blue font-mono">
                    {call.symbol}
                  </td>
                  <td className="px-2 py-1 text-text-secondary text-right font-mono">
                    {formatDuration(call.duration)}
                  </td>
                  <td className="px-2 py-1 text-text-secondary text-right font-mono">
                    {formatDataAge(call.dataAge)}
                  </td>
                  <td className={`px-2 py-1 text-center ${getStatusColor(call.status)}`}>
                    {call.status === 'pending' && '●'}
                    {call.status === 'success' && '✓'}
                    {call.status === 'error' && '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="px-3 py-2 bg-bg-tertiary border-t border-border text-xs">
        <div className="flex justify-between text-text-secondary">
          <span>Total calls: {calls.length}</span>
          <span>
            Success: {calls.filter(c => c.status === 'success').length} |
            Error: {calls.filter(c => c.status === 'error').length}
          </span>
        </div>
      </div>
    </div>
  );
}
