import UserService from "../services/UserService.js";

class UserController {
  // Get Profile
  async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);

      return res.status(200).json({
        success: true,
        message: "Profile fetched successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Profile
  async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(
        req.user.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Change Password
  async changePassword(req, res, next) {
    try {
      const result = await UserService.changePassword(
        req.user.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete Account (Soft Delete)
  async deleteAccount(req, res, next) {
    try {
      const result = await UserService.deleteAccount(req.user.id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();