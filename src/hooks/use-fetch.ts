import { useState, useEffect } from "react";

const useFetch = <T>(uri: string | null) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [hasError, setHasError] = useState(false);

  const fetchData = async () => {
    if (!uri) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(uri);
      if (!response.ok) {
        setHasError(true);
        return;
      }
      const data = await response.json();
      setData(data);
      setHasData(true);
    } catch (err: unknown) {
      setHasError(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [uri]);

  return {
    loading,
    data,
    hasData,
    error,
    hasError,
  };
};

export { useFetch };
