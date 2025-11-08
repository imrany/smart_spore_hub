import { SERVER_URL } from "@/lib/utils";
import { useState } from "react";

type FetchOptions = {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  redirect?: RequestRedirect;
};

export function useFetch<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (endpoint: string, options: FetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `HTTP error! status: ${response.status}`);
      }

      setData(json);
      return { data: json, error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, fetchData };
}
