import jwt from "jsonwebtoken";

import jwtConfig from "../config/jwt.js";

const AuthMiddleware = (req, res, next) => {
    try {

        console.log("Headers:", req.headers);
        console.log("Authorization:", req.headers.authorization);
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

        // Store User Information
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