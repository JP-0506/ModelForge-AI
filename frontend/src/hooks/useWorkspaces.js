/* ============================================================
   useWorkspaces — hook for workspace list page with stats
   ============================================================ */
import { useState, useEffect, useCallback } from 'react';
import workspaceService from '../services/workspaceService';

const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workspaceService.getAllWithStats();
      setWorkspaces(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (body) => {
    const created = await workspaceService.create(body);
    const enriched = { ...created, projectCount: 0, datasetCount: 0 };
    setWorkspaces((prev) => [enriched, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id, body) => {
    const updated = await workspaceService.update(id, body);
    setWorkspaces((prev) => prev.map((w) => (w._id === id ? { ...w, ...updated } : w)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await workspaceService.delete(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
  }, []);

  return { workspaces, isLoading, error, refetch: fetchAll, create, update, remove };
};

export default useWorkspaces;

