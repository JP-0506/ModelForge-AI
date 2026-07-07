import WorkspaceRepository from "../repositories/WorkspaceRepository.js";

class WorkspaceService {
  // Create Workspace
  async createWorkspace(userId, workspaceData) {
    const { workspace_name, description } = workspaceData;

    const workspace = await WorkspaceRepository.createWorkspace({
      user_id: userId,
      workspace_name,
      description,
    });

    return workspace;
  }

  // Get All Workspaces
  async getAllWorkspaces(userId) {
    return await WorkspaceRepository.getAllWorkspaces(userId);
  }

  // Get Workspace By ID
  async getWorkspaceById(workspaceId, userId) {
    const workspace = await WorkspaceRepository.getWorkspaceById(
      workspaceId,
      userId
    );

    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.statusCode = 404;
      throw error;
    }

    return workspace;
  }

  // Update Workspace
  async updateWorkspace(workspaceId, userId, workspaceData) {
    const workspace = await WorkspaceRepository.updateWorkspace(
      workspaceId,
      userId,
      workspaceData
    );

    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.statusCode = 404;
      throw error;
    }

    return workspace;
  }

  // Delete Workspace (Soft Delete)
  async deleteWorkspace(workspaceId, userId) {
    const workspace = await WorkspaceRepository.deleteWorkspace(
      workspaceId,
      userId
    );

    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.statusCode = 404;
      throw error;
    }

    return {
      message: "Workspace deleted successfully.",
    };
  }
}

export default new WorkspaceService();