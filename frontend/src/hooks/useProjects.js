/* ============================================================
   useProjects — hook for Project list management by workspaceId
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';

const useProjects = (workspaceId) => {
  const [projects, setProjects]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getByWorkspaceWithStats(workspaceId);
      setProjects(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body) => {
    const created = await projectService.create({
      ...body,
      workspace_id: workspaceId,
    });
    const enriched = { ...created, datasetCount: 0 };
    setProjects((prev) => [enriched, ...prev]);
    return created;
  }, [workspaceId]);

  const update = useCallback(async (id, body) => {
    const updated = await projectService.update(id, body);
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...updated } : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await projectService.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  }, []);

  return { projects, isLoading, error, refetch: fetchAll, create, update, remove };
};

export default useProjects;
