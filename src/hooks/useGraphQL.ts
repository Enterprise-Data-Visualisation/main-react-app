import { useState, useEffect, useCallback } from "react";

// Define the shape of the GraphQL Response wrapper
interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

// Define the return type of our hook
interface UseGraphqlResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

// TData = The shape of the data you expect (e.g., { getSignals: Signal[] })
// TVariables = The shape of variables (default to empty object)
export function useGraphql<
  TData = unknown,
  TVariables = Record<string, unknown>
>(
  query: string,
  variables: TVariables = {} as TVariables
): UseGraphqlResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      // Strict typing for the raw JSON response
      const result: GraphqlResponse<TData> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (result.data) {
        setData(result.data);
      }
    } catch (err) {
      // Safely handle unknown error types in catch block
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [query, variables]); // Check generic equality or primitive references

  // Fallback: Use mock data if endpoint is not available
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !data && !error) {
        // If still loading after 2 seconds, switch to mock data
        const mockData: TData = {
          getSignals: [
            {
              id: "signal_01",
              name: "Temperature Sensor",
              location: "Building A",
              type: "Temperature",
            },
            {
              id: "signal_02",
              name: "Humidity Sensor",
              location: "Building B",
              type: "Humidity",
            },
            {
              id: "signal_03",
              name: "Pressure Gauge",
              location: "Lab 1",
              type: "Pressure",
            },
            {
              id: "signal_04",
              name: "Flow Meter",
              location: "Lab 2",
              type: "Flow",
            },
            {
              id: "signal_05",
              name: "Power Monitor",
              location: "Server Room",
              type: "Power",
            },
          ],
        } as TData;
        setData(mockData);
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, data, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
