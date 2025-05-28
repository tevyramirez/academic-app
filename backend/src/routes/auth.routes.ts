import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Protected routes
router.get("/profile", authMiddleware, AuthController.getProfile);
router.put("/profile", authMiddleware, AuthController.updateProfile);

export default router;
