import AuthService from "../services/AuthService.js";

class AuthController {
  // Register
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);

      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();