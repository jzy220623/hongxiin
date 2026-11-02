import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<{ data: T }>,
  autoFetch = true,
  ...initialArgs: unknown[]
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiFunction(...args);
        const result = response.data;
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '请求失败，请稍后再试';
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: message });
        }
        return null;
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) {
      execute(...initialArgs);
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { ...state, execute };
}