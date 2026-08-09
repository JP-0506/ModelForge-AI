/* ============================================================
   Project Service — API calls for Project management
   Endpoints from Node.js backend:
     GET    /api/projects/workspace/:workspaceId → list projects by workspace
     POST   /api/projects                       → create project
     GET    /api/projects/:id                   → get single project
     PUT    /api/projects/:id                   → update project
     DELETE /api/projects/:id                   → soft-delete project
     GET    /api/datasets/project/:projectId    → list datasets in project
   ============================================================ */

import api from './api';

const projectService = {

  /** List all projects for a specific workspace */
  getByWorkspace: async (workspaceId) => {
    const res = await api.get(`/api/projects/workspace/${workspaceId}`);
    return res.data.data; // Project[]
  },

  /** Get single project by ID */
  getById: async (projectId) => {
    const res = await api.get(`/api/projects/${projectId}`);
    return res.data.data; // Project
  },

  /**
   * Create project
   * Body: { workspace_id, project_name, problem_type, description? }
   */
  create: async (body) => {
    const res = await api.post('/api/projects', body);
    return res.data.data; // Created Project
  },

  /**
   * Update project
   * Body: { project_name?, problem_type?, description? }
   */
  update: async (projectId, body) => {
    const res = await api.put(`/api/projects/${projectId}`, body);
    return res.data.data; // Updated Project
  },

  /** Soft-delete project */
  delete: async (projectId) => {
    const res = await api.delete(`/api/projects/${projectId}`);
    return res.data;
  },

  /** List datasets for a project */
  getDatasets: async (projectId) => {
    const res = await api.get(`/api/datasets/project/${projectId}`);
    return res.data.data; // Dataset[]
  },

  /** Get project enriched with dataset count */
  getWithStats: async (projectId) => {
    const [project, datasets] = await Promise.all([
      projectService.getById(projectId),
      projectService.getDatasets(projectId).catch(() => []),
    ]);

    return {
      project,
      datasets,
      datasetCount: datasets.length,
    };
  },

  /** Get all projects in workspace enriched with dataset counts */
  getByWorkspaceWithStats: async (workspaceId) => {
    const projects = await projectService.getByWorkspace(workspaceId);
    const enriched = await Promise.all(
      (projects || []).map(async (p) => {
        try {
          const datasets = await projectService.getDatasets(p._id);
          return { ...p, datasetCount: datasets.length };
        } catch {
          return { ...p, datasetCount: 0 };
        }
      })
    );
    return enriched;
  },
};

export default projectService;
