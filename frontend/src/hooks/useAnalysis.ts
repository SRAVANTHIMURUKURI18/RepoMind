import { useEffect, useRef, useState } from 'react';
import { getResults, getStatus } from '../lib/api';
import type { AnalysisStatusResponse, FullResults } from '../types';

interface UseAnalysisReturn {
  status:   AnalysisStatusResponse | null;
  results:  FullResults | null;
  loading:  boolean;
  error:    string | null;
  isRunning: boolean;
  isDone:   boolean;
}

export function useAnalysis(analysisId: string | null, intervalMs = 1500): UseAnalysisReturn {
  const [status,  setStatus]  = useState<AnalysisStatusResponse | null>(null);
  const [results, setResults] = useState<FullResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    setLoading(true);
    setError(null);

    const poll = async () => {
      try {
        const s = await getStatus(analysisId);
        setStatus(s);

        if (s.status === 'completed') {
          clearInterval(timerRef.current!);
          const r = await getResults(analysisId);
          setResults(r);
          setLoading(false);
        } else if (s.status === 'failed') {
          clearInterval(timerRef.current!);
          setError(s.error ?? 'Analysis failed');
          setLoading(false);
        }
      } catch (e: any) {
        clearInterval(timerRef.current!);
        setError(e?.response?.data?.detail ?? 'Network error');
        setLoading(false);
      }
    };

    poll();
    timerRef.current = setInterval(poll, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [analysisId, intervalMs]);

  return {
    status,
    results,
    loading,
    error,
    isRunning: status?.status === 'running' || status?.status === 'pending',
    isDone:    status?.status === 'completed',
  };
}
