import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import questionRoutes from "./routes/question.routes";

// Create Express application
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/questions", questionRoutes);

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