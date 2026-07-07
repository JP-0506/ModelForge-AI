import Workspace from "../models/Workspace.js";

class WorkspaceRepository {
  // Create Workspace
  async createWorkspace(workspaceData) {
    return await Workspace.create(workspaceData);
  }

  // Get All Workspaces of Logged-in User
  async getAllWorkspaces(userId) {
    return await Workspace.find({
      user_id: userId,
      is_deleted: false,
    }).sort({ created_at: -1 });
  }

  // Get Workspace By ID
  async getWorkspaceById(workspaceId, userId) {
    return await Workspace.findOne({
      _id: workspaceId,
      user_id: userId,
      is_deleted: false,
    });
  }

  // Update Workspace
  async updateWorkspace(workspaceId, userId, workspaceData) {
    await Workspace.findOneAndUpdate(
      {
        _id: workspaceId,
        user_id: userId,
        is_deleted: false,
      },
      {
        ...workspaceData,
        updated_at: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return await Workspace.findOne({
      _id: workspaceId,
      user_id: userId,
      is_deleted: false,
    });
  }

  // Soft Delete Workspace
  async deleteWorkspace(workspaceId, userId) {
    return await Workspace.findOneAndUpdate(
      {
        _id: workspaceId,
        user_id: userId,
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

export default new WorkspaceRepository();