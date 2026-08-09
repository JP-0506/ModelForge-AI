/* ============================================================
   Dashboard Service — fetches stats & recent data for the dashboard
   All calls go through the Node.js backend (port 5000)
   ============================================================ */

import api from './api';

const dashboardService = {

  /**
   * Fetch workspace count + list for current user
   * GET /api/workspaces  → { success, data: Workspace[] }
   */
  getWorkspaces: async () => {
    const res = await api.get('/api/workspaces');
    return res.data.data; // array of { _id, workspace_name, description, created_at, updated_at }
  },

  /**
   * Fetch all projects in a single workspace
   * GET /api/projects/workspace/:workspaceId → { success, data: Project[] }
   */
  getProjectsByWorkspace: async (workspaceId) => {
    const res = await api.get(`/api/projects/workspace/${workspaceId}`);
    return res.data.data; // array of { _id, project_name, problem_type, status, created_at }
  },

  /**
   * Fetch datasets for a project
   * GET /api/datasets/project/:projectId → { success, data: Dataset[] }
   */
  getDatasetsByProject: async (projectId) => {
    const res = await api.get(`/api/datasets/project/${projectId}`);
    return res.data.data; // array of { _id, dataset_name, current_version, created_at }
  },

  /**
   * Aggregate dashboard stats:
   * - Workspace count
   * - Project count (across all workspaces)
   * - Dataset count (across all projects)
   * - Recent experiments list
   * - Recent workspaces / activity feed
   */
  getDashboardStats: async () => {
    // 1 — Get all workspaces
    const workspaces = await dashboardService.getWorkspaces();
    const workspaceCount = workspaces.length;

    if (workspaceCount === 0) {
      return {
        workspaceCount: 0,
        projectCount: 0,
        datasetCount: 0,
        allProjects: [],
        allDatasets: [],
        recentWorkspaces: [],
        recentProjects: [],
      };
    }

    // 2 — Get all projects from all workspaces in parallel
    const projectArrays = await Promise.all(
      workspaces.map((ws) =>
        dashboardService.getProjectsByWorkspace(ws._id).catch((err) => {
          console.warn(`[Dashboard] Failed to fetch projects for workspace ${ws._id}:`, err.message);
          return [];
        })
      )
    );

    // Enrich projects with their workspace name
    const allProjects = projectArrays.flatMap((projects, i) =>
      projects.map((p) => ({
        ...p,
        workspace_name: workspaces[i].workspace_name,
        workspace_id: workspaces[i]._id,
      }))
    );

    const projectCount = allProjects.length;

    // 3 — Get datasets from all projects in parallel
    const recentProjects = [...allProjects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    const datasetArrays = await Promise.all(
      allProjects.map((p) =>
        dashboardService.getDatasetsByProject(p._id).catch((err) => {
          console.warn(`[Dashboard] Failed to fetch datasets for project ${p._id}:`, err.message);
          return [];
        })
      )
    );

    const allDatasets = datasetArrays.flatMap((datasets, i) =>
      datasets.map((d) => ({
        ...d,
        project_name: allProjects[i].project_name,
        project_id: allProjects[i]._id,
      }))
    );

    const datasetCount = allDatasets.length;

    // 4 — Recent workspaces (sorted by created_at desc)
    const recentWorkspaces = [...workspaces]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      workspaceCount,
      projectCount,
      datasetCount,
      allProjects,
      allDatasets,
      recentWorkspaces,
      recentProjects,
    };
  },
};

export default dashboardService;
