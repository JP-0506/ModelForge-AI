import bcrypt from "bcrypt";

import AuthRepository from "../repositories/AuthRepository.js";
import EmailService from "./EmailService.js";
import { generateToken } from "../config/jwt.js";

class AuthService {
  // Register
  async register(userData) {
    const { fullName, email, phone, bio, password } = userData;

    const existingUser = await AuthRepository.findUserByEmail(email);

    if (existingUser) {
      const error = new Error("User already exists with this email.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await AuthRepository.createUser({
      fullName,
      email,
      phone,
      bio,
    });

    await AuthRepository.createAuth({
      user_id: user._id,
      password: hashedPassword,
    });

    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      bio: user.bio,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  // Login
  async login(loginData) {
    const { email, password } = loginData;

    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const auth = await AuthRepository.findAuthByUserId(user._id);

    const isPasswordMatched = await bcrypt.compare(
      password,
      auth.password
    );

    if (!isPasswordMatched) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    return {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        bio: user.bio,
      },
    };
  }

  // ==========================================
  // Forgot Password / OTP Flow
  // ==========================================

  // Step 1: Send OTP
  async forgotPassword(email) {
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      const error = new Error("No account found with this email address.");
      error.statusCode = 404;
      throw error;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await AuthRepository.saveOTP(email, otp, expiresAt);
    await EmailService.sendOTPEmail(email, otp);

    return {
      message: "One-Time Password (OTP) sent to your email address.",
      email,
    };
  }

  // Step 2: Verify OTP
  async verifyOTP(email, otp) {
    const validOtpRecord = await AuthRepository.findValidOTP(email, otp);

    if (!validOtpRecord) {
      const error = new Error("Invalid or expired OTP code. Please try requesting a new OTP.");
      error.statusCode = 400;
      throw error;
    }

    await AuthRepository.markOTPVerified(email, otp);

    return {
      message: "OTP verified successfully. You can now reset your password.",
      email,
      otp,
    };
  }

  // Step 3: Reset Password
  async resetPassword(email, otp, newPassword) {
    const verifiedRecord = await AuthRepository.findVerifiedOTP(email, otp);

    if (!verifiedRecord) {
      const error = new Error("Invalid or unverified OTP session. Please verify your OTP again.");
      error.statusCode = 400;
      throw error;
    }

    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      const error = new Error("User account not found.");
      error.statusCode = 404;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AuthRepository.updatePassword(user._id, hashedPassword);
    await AuthRepository.deleteOTPByEmail(email);

    return {
      message: "Password reset successfully. You can now log in with your new password.",
    };
  }
}

export default new AuthService();