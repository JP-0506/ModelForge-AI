import WorkspaceService from "../services/WorkspaceService.js";

class WorkspaceController {
  // Create Workspace
  async createWorkspace(req, res, next) {
    try {
      const workspace = await WorkspaceService.createWorkspace(
        req.user.id,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Workspace created successfully.",
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get All Workspaces
  async getAllWorkspaces(req, res, next) {
    try {
      const workspaces = await WorkspaceService.getAllWorkspaces(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Workspaces fetched successfully.",
        data: workspaces,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Workspace By ID
  async getWorkspaceById(req, res, next) {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(
        req.params.id,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: "Workspace fetched successfully.",
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Workspace
  async updateWorkspace(req, res, next) {
    try {
      const workspace = await WorkspaceService.updateWorkspace(
        req.params.id,
        req.user.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Workspace updated successfully.",
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete Workspace (Soft Delete)
  async deleteWorkspace(req, res, next) {
    try {
      const result = await WorkspaceService.deleteWorkspace(
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

export default new WorkspaceController();