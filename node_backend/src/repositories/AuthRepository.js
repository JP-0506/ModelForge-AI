import User from "../models/User.js";
import Auth from "../models/Auth.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";

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

  // ==========================================
  // Password Reset OTP Management
  // ==========================================

  // Save OTP (delete existing pending OTPs for email first)
  async saveOTP(email, otp, expiresAt) {
    await PasswordResetOTP.deleteMany({ email: email.toLowerCase() });
    return await PasswordResetOTP.create({
      email: email.toLowerCase(),
      otp,
      expires_at: expiresAt,
    });
  }

  // Find Valid OTP
  async findValidOTP(email, otp) {
    return await PasswordResetOTP.findOne({
      email: email.toLowerCase(),
      otp,
      expires_at: { $gt: new Date() },
    });
  }

  // Mark OTP Verified
  async markOTPVerified(email, otp) {
    return await PasswordResetOTP.findOneAndUpdate(
      {
        email: email.toLowerCase(),
        otp,
        expires_at: { $gt: new Date() },
      },
      {
        verified: true,
      },
      {
        new: true,
      }
    );
  }

  // Find Verified OTP
  async findVerifiedOTP(email, otp) {
    return await PasswordResetOTP.findOne({
      email: email.toLowerCase(),
      otp,
      verified: true,
    });
  }

  // Delete OTP by Email
  async deleteOTPByEmail(email) {
    return await PasswordResetOTP.deleteMany({ email: email.toLowerCase() });
  }
}

export default new AuthRepository();