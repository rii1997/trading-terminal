import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '../types/fmp';

export function useIncomeStatement(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 40) {
  const [data, setData] = useState<IncomeStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.incomeStatement(symbol, period, limit)
      .then((res) => {
        setData(res || []);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [symbol, period, limit]);

  return { data, loading, error };
}

export function useBalanceSheet(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 40) {
  const [data, setData] = useState<BalanceSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.balanceSheet(symbol, period, limit)
      .then((res) => {
        setData(res || []);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [symbol, period, limit]);

  return { data, loading, error };
}

export function useCashFlow(symbol: string, period: 'annual' | 'quarter' = 'annual', limit = 40) {
  const [data, setData] = useState<CashFlowStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.cashFlow(symbol, period, limit)
      .then((res) => {
        setData(res || []);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [symbol, period, limit]);

  return { data, loading, error };
}
