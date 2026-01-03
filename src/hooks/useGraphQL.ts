import { useState, useEffect, useCallback, useRef } from 'react';

// Define the return type of our hook
interface UseGraphqlResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Mock data for production deployment (no GraphQL backend)
const MOCK_SIGNALS = [
  {
    id: 'signal_01',
    name: 'Temperature Sensor',
    location: 'Building A',
    type: 'Temperature',
  },
  {
    id: 'signal_02',
    name: 'Humidity Sensor',
    location: 'Building B',
    type: 'Humidity',
  },
  {
    id: 'signal_03',
    name: 'Pressure Gauge',
    location: 'Lab 1',
    type: 'Pressure',
  },
  {
    id: 'signal_04',
    name: 'Flow Meter',
    location: 'Lab 2',
    type: 'Flow',
  },
  {
    id: 'signal_05',
    name: 'Power Monitor',
    location: 'Server Room',
    type: 'Power',
  },
];

// TData = The shape of the data you expect (e.g., { getSignals: Signal[] })
// TVariables = The shape of variables (default to empty object)
export function useGraphql<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  // These parameters are unused in mock implementation but kept for API compatibility
  _query: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _variables: TVariables = {} as TVariables
): UseGraphqlResult<TData> {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Simulate async loading
    await new Promise((resolve) => setTimeout(resolve, 100));
    const mockData = { getSignals: MOCK_SIGNALS } as TData;
    return mockData;
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true }));
    const mockData = await fetchData();
    if (isMountedRef.current) {
      setState({ data: mockData, loading: false, error: null });
    }
  }, [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;

    // Load initial data
    fetchData().then((mockData) => {
      if (isMountedRef.current) {
        setState({ data: mockData, loading: false, error: null });
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
}
