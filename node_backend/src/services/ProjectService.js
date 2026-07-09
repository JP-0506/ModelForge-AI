import ProjectRepository from "../repositories/ProjectRepository.js";
import WorkspaceRepository from "../repositories/WorkspaceRepository.js";

class ProjectService {
  // Create Project
  async createProject(userId, projectData) {
    const {
      workspace_id,
      project_name,
      description,
      problem_type,
    } = projectData;

    // Check Workspace
    const workspace = await WorkspaceRepository.getWorkspaceById(
      workspace_id,
      userId
    );

    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.statusCode = 404;
      throw error;
    }

    return await ProjectRepository.createProject({
      workspace_id,
      project_name,
      description,
      problem_type,
    });
  }

  // Get All Projects of Workspace
  async getProjectsByWorkspace(workspaceId, userId) {
    // Verify Workspace Ownership
    const workspace = await WorkspaceRepository.getWorkspaceById(
      workspaceId,
      userId
    );

    if (!workspace) {
      const error = new Error("Workspace not found.");
      error.statusCode = 404;
      throw error;
    }

    return await ProjectRepository.getProjectsByWorkspace(workspaceId);
  }

  // Get Project By ID
  async getProjectById(projectId, userId) {
    const project = await ProjectRepository.getProjectById(projectId);

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace = await WorkspaceRepository.getWorkspaceById(
      project.workspace_id,
      userId
    );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  // Update Project
  async updateProject(projectId, userId, projectData) {
    const project = await this.getProjectById(projectId, userId);

    return await ProjectRepository.updateProject(
      project._id,
      projectData
    );
  }

  // Delete Project
  async deleteProject(projectId, userId) {
    const project = await this.getProjectById(projectId, userId);

    await ProjectRepository.deleteProject(project._id);

    return {
      message: "Project deleted successfully.",
    };
  }
}

export default new ProjectService();