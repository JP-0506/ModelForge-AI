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

  // Forgot Password (Request OTP)
  async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email },
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email, otp: result.otp },
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, otp, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();