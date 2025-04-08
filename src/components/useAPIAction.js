import { useState, useCallback } from "react";

export const useApiAction = () => {
  const [loadingMap, setLoadingMap] = useState({});

  const runAction = useCallback(async (key, apiFunc) => {
    setLoadingMap(prev => ({ ...prev, [key]: true }));
    try {
      await apiFunc();
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const isLoading = useCallback(
    (key) => !!loadingMap[key],
    [loadingMap]
  );

  return { runAction, isLoading };
};
