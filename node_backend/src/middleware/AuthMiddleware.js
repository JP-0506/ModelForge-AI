import jwt from "jsonwebtoken";

import jwtConfig from "../config/jwt.js";
import User from "../models/User.js";

const AuthMiddleware = async (req, res, next) => {
  try {
    // Get Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    // Check Bearer Token
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    // Extract Token
    const token = authHeader.split(" ")[1];

    // Verify Token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Check User Exists and is Not Deleted
    const user = await User.findOne({
      _id: decoded.id,
      is_deleted: false,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found or has been deleted.",
      });
    }

    // Store Logged-in User
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default AuthMiddleware;