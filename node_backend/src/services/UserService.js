import bcrypt from "bcrypt";

import UserRepository from "../repositories/UserRepository.js";

class UserService {
  // Get Profile
  async getProfile(userId) {
    const user = await UserRepository.getProfile(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  // Update Profile
  async updateProfile(userId, userData) {
    const user = await UserRepository.updateProfile(userId, userData);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  // Change Password
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    // Get Auth Record
    const auth = await UserRepository.getAuthByUserId(userId);

    if (!auth) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Current Password
    const isPasswordMatched = await bcrypt.compare(
      currentPassword,
      auth.password
    );

    if (!isPasswordMatched) {
      const error = new Error("Current password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password
    await UserRepository.updatePassword(userId, hashedPassword);

    return {
      message: "Password changed successfully.",
    };
  }

  // Delete Account (Soft Delete)
  async deleteAccount(userId) {
    const user = await UserRepository.deleteAccount(userId);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    return {
      message: "Account deleted successfully.",
    };
  }
}

export default new UserService();