import Project from "../models/Project.js";

class ProjectRepository {
  // Create Project
  async createProject(projectData) {
    return await Project.create(projectData);
  }

  // Get All Projects by Workspace
  async getProjectsByWorkspace(workspaceId) {
    return await Project.find({
      workspace_id: workspaceId,
      is_deleted: false,
    }).sort({ created_at: -1 });
  }

  // Get Project By ID
  async getProjectById(projectId) {
    return await Project.findOne({
      _id: projectId,
      is_deleted: false,
    });
  }

  // Update Project
  async updateProject(projectId, projectData) {
    await Project.findOneAndUpdate(
      {
        _id: projectId,
        is_deleted: false,
      },
      {
        ...projectData,
        updated_at: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return await Project.findOne({
      _id: projectId,
      is_deleted: false,
    });
  }

  // Soft Delete Project
  async deleteProject(projectId) {
    return await Project.findOneAndUpdate(
      {
        _id: projectId,
        is_deleted: false,
      },
      {
        is_deleted: true,
        updated_at: new Date(),
      },
      {
        new: true,
      }
    );
  }
}

export default new ProjectRepository();