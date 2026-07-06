import { Router } from "express";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const router = Router();

router.get("/profile", AuthMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token verified successfully.",
    user: req.user,
  });
});

export default router;