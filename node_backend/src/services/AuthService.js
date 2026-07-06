import bcrypt from "bcrypt";

import AuthRepository from "../repositories/AuthRepository.js";
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
}

export default new AuthService();