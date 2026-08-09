/* ============================================================
   Workspace Service — full CRUD + project & dataset count aggregation
   Endpoints from Node.js backend:
     GET    /api/workspaces                → list user's workspaces
     POST   /api/workspaces               → create workspace
     GET    /api/workspaces/:id           → get single workspace
     PUT    /api/workspaces/:id           → update workspace
     DELETE /api/workspaces/:id          → soft-delete workspace
     GET    /api/projects/workspace/:id  → projects in workspace
     GET    /api/datasets/project/:id    → datasets in project
   ============================================================ */

import api from './api';

const workspaceService = {

  /** List all workspaces for current user */
  getAll: async () => {
    const res = await api.get('/api/workspaces');
    return res.data.data; // Workspace[]
  },

  /** Get single workspace */
  getById: async (id) => {
    const res = await api.get(`/api/workspaces/${id}`);
    return res.data.data;
  },

  /** Create workspace — body: { workspace_name, description? } */
  create: async (body) => {
    const res = await api.post('/api/workspaces', body);
    return res.data.data;
  },

  /** Update workspace — body: { workspace_name?, description? } */
  update: async (id, body) => {
    const res = await api.put(`/api/workspaces/${id}`, body);
    return res.data.data;
  },

  /** Soft-delete workspace */
  delete: async (id) => {
    const res = await api.delete(`/api/workspaces/${id}`);
    return res.data;
  },

  /** Get projects that belong to a workspace */
  getProjects: async (workspaceId) => {
    const res = await api.get(`/api/projects/workspace/${workspaceId}`);
    return res.data.data; // Project[]
  },

  /** Get datasets that belong to a project */
  getDatasetsByProject: async (projectId) => {
    const res = await api.get(`/api/datasets/project/${projectId}`);
    return res.data.data; // Dataset[]
  },

  /**
   * Get workspace with enriched stats (projects, datasets, etc.)
   * Aggregates client-side since there's no single /stats endpoint
   */
  getWithStats: async (workspaceId) => {
    const [workspace, projects] = await Promise.all([
      workspaceService.getById(workspaceId),
      workspaceService.getProjects(workspaceId).catch(() => []),
    ]);

    const datasetArrays = await Promise.all(
      (projects || []).map((p) =>
        workspaceService.getDatasetsByProject(p._id).catch(() => [])
      )
    );
    const datasets = datasetArrays.flat();

    return {
      workspace,
      projects,
      datasets,
      projectCount: projects.length,
      datasetCount: datasets.length,
    };
  },

  /**
   * Enriches a list of workspaces with project and dataset counts in parallel
   */
  getAllWithStats: async () => {
    const workspaces = await workspaceService.getAll();
    const enriched = await Promise.all(
      workspaces.map(async (ws) => {
        try {
          const stats = await workspaceService.getWithStats(ws._id);
          return {
            ...ws,
            projectCount: stats.projectCount,
            datasetCount: stats.datasetCount,
          };
        } catch {
          return { ...ws, projectCount: 0, datasetCount: 0 };
        }
      })
    );
    return enriched;
  },
};

export default workspaceService;
