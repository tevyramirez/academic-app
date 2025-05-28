import express from "express";
import { ProgressController } from "../controllers/progress.controller";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Progress routes - require authentication
router.post("/progress", authMiddleware, ProgressController.recordProgress);
router.get("/progress", authMiddleware, ProgressController.getUserProgress);
router.get("/progress/stats", authMiddleware, ProgressController.getProgressStats);

// Analytics routes - require authentication
router.post("/analytics/generate", authMiddleware, AnalyticsController.generateUserAnalytics);
router.get("/analytics", authMiddleware, AnalyticsController.getUserAnalytics);

export default router;
