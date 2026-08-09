/* ============================================================
   useDatasets — hook for managing dataset list state per project
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import datasetService from '../services/datasetService';

const useDatasets = (projectId) => {
  const [datasets, setDatasets]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const fetchDatasets = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await datasetService.getByProject(projectId);
      setDatasets(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load datasets');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    datasets,
    isLoading,
    error,
    refresh: fetchDatasets,
    setDatasets,
  };
};

export default useDatasets;
