import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import questionRoutes from "./routes/question.routes";
import authRoutes from "./routes/auth.routes";
import analyticsRoutes from "./routes/analytics.routes";

// Create Express application
const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/v1", analyticsRoutes);

// Home route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Study App API",
    version: "1.0.0",
    endpoints: {
      questions: {
        get_all: "GET /api/questions",
        create: "POST /api/questions/raw"
      }
    }
  });
});

// 404 Not Found handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Resource not found"
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

export default app;