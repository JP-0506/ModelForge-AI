import User from "../models/User.js";
import Auth from "../models/Auth.js";

class AuthRepository {
  // Create User
  async createUser(userData) {
    return await User.create(userData);
  }

  // Find User by Email
  async findUserByEmail(email) {
    return await User.findOne({
      email,
      is_deleted: false,
    });
  }

  // Find User by ID
  async findUserById(userId) {
    return await User.findOne({
      _id: userId,
      is_deleted: false,
    });
  }

  // Create Auth
  async createAuth(authData) {
    return await Auth.create(authData);
  }

  // Find Auth by User ID
  async findAuthByUserId(userId) {
    return await Auth.findOne({
      user_id: userId,
    });
  }

  // Update Password
  async updatePassword(userId, hashedPassword) {
    return await Auth.findOneAndUpdate(
      { user_id: userId },
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );
  }

  // Soft Delete User
  async deleteUser(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        is_deleted: true,
      },
      {
        new: true,
      }
    );
  }
}

export default new AuthRepository();