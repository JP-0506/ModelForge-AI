import ProjectService from "../services/ProjectService.js";

class ProjectController {
  // Create Project
  async createProject(req, res, next) {
    try {
      const project = await ProjectService.createProject(
        req.user.id,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Project created successfully.",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get All Projects by Workspace
  async getProjectsByWorkspace(req, res, next) {
    try {
      const projects = await ProjectService.getProjectsByWorkspace(
        req.params.workspaceId,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: "Projects fetched successfully.",
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Project By ID
  async getProjectById(req, res, next) {
    try {
      const project = await ProjectService.getProjectById(
        req.params.id,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: "Project fetched successfully.",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Project
  async updateProject(req, res, next) {
    try {
      const project = await ProjectService.updateProject(
        req.params.id,
        req.user.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Project updated successfully.",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete Project (Soft Delete)
  async deleteProject(req, res, next) {
    try {
      const result = await ProjectService.deleteProject(
        req.params.id,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();