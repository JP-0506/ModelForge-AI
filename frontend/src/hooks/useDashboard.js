/* ============================================================
   useDashboard Hook — loads all dashboard data with loading/error state
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

const useDashboard = () => {
  const [stats, setStats] = useState({
    workspaceCount: 0,
    projectCount: 0,
    datasetCount: 0,
    allProjects: [],
    allDatasets: [],
    recentWorkspaces: [],
    recentProjects: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

export default useDashboard;
