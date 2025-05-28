import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UserProgress } from "../entities/user-progress.entity";
import { AuthRequest } from "../middleware/auth.middleware";

const progressRepository = AppDataSource.getRepository(UserProgress);

export class ProgressController {
  static async recordProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { preguntaId, answer, isCorrect, responseTime, metadata } = req.body;

      const progress = new UserProgress();
      progress.user = req.user;
      progress.pregunta = { id: preguntaId } as any;
      progress.answer = answer;
      progress.is_correct = isCorrect;
      progress.response_time = responseTime;
      if (metadata) {
        progress.metadata = metadata;
      }

      await progressRepository.save(progress);

      return res.status(201).json({
        message: "Progress recorded successfully",
        progress,
      });
    } catch (error) {
      console.error("Record progress error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getUserProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const progress = await progressRepository
        .createQueryBuilder("progress")
        .innerJoinAndSelect("progress.pregunta", "pregunta")
        .where("progress.user_id = :userId", { userId: req.user.id })
        .orderBy("progress.created_at", "DESC")
        .getMany();

      return res.json(progress);
    } catch (error) {
      console.error("Get user progress error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getProgressStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get overall stats
      const stats = await progressRepository
        .createQueryBuilder("progress")
        .select([
          "COUNT(*) as total_answers",
          "SUM(CASE WHEN progress.is_correct THEN 1 ELSE 0 END) as correct_answers",
          "AVG(CASE WHEN progress.is_correct THEN 1 ELSE 0 END) * 100 as accuracy_percentage",
          "AVG(progress.response_time) as avg_response_time"
        ])
        .where("progress.user_id = :userId", { userId: req.user.id })
        .getRawOne();

      // Get daily stats for the last 30 days
      const dailyStats = await progressRepository
        .createQueryBuilder("progress")
        .select([
          "DATE(progress.created_at) as date",
          "COUNT(*) as answers",
          "SUM(CASE WHEN progress.is_correct THEN 1 ELSE 0 END) as correct_answers",
          "AVG(progress.response_time) as avg_response_time"
        ])
        .where("progress.user_id = :userId", { userId: req.user.id })
        .andWhere("progress.created_at >= :startDate", { 
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        })
        .groupBy("DATE(progress.created_at)")
        .orderBy("DATE(progress.created_at)", "DESC")
        .getRawMany();

      return res.json({
        overall: stats,
        daily: dailyStats
      });
    } catch (error) {
      console.error("Get progress stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
