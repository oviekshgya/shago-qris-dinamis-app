import { useCallback, useState } from 'react';

export function useApi<TArgs extends unknown[], TResult>(request: (...args: TArgs) => Promise<TResult>) {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await request(...args);
        setData(result);
        return result;
      } catch (apiError) {
        const message = apiError instanceof Error ? apiError.message : 'API request failed.';
        setError(message);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  return { data, error, loading, execute };
}
