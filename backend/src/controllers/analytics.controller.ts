import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UserAnalytics } from "../entities/user-analytics.entity";
import { UserProgress } from "../entities/user-progress.entity";
import { AuthRequest } from "../middleware/auth.middleware";

const analyticsRepository = AppDataSource.getRepository(UserAnalytics);
const progressRepository = AppDataSource.getRepository(UserProgress);

export class AnalyticsController {
  static async generateUserAnalytics(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user's progress data
      const progress = await progressRepository
        .createQueryBuilder("progress")
        .innerJoinAndSelect("progress.pregunta", "pregunta")
        .where("progress.user_id = :userId", { userId: req.user.id })
        .orderBy("progress.created_at", "DESC")
        .getMany();

      // Calculate performance metrics
      const totalAnswers = progress.length;
      const correctAnswers = progress.filter(p => p.is_correct).length;
      const overallAccuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      // Calculate topics accuracy
      const topicsStats: { [key: string]: { total: number; correct: number } } = {};
      progress.forEach(p => {
        const topic = p.metadata?.topic || "general";
        if (!topicsStats[topic]) {
          topicsStats[topic] = {
            total: 0,
            correct: 0
          };
        }
        topicsStats[topic].total++;
        if (p.is_correct) {
          topicsStats[topic].correct++;
        }
      });

      const topicsAccuracy: { [key: string]: number } = {};
      Object.entries(topicsStats).forEach(([topic, stats]) => {
        topicsAccuracy[topic] = (stats.correct / stats.total) * 100;
      });

      // Calculate improvement rate
      const recentProgress = progress.slice(0, Math.floor(progress.length / 2));
      const olderProgress = progress.slice(Math.floor(progress.length / 2));
      const recentAccuracy = recentProgress.filter(p => p.is_correct).length / recentProgress.length * 100;
      const olderAccuracy = olderProgress.filter(p => p.is_correct).length / olderProgress.length * 100;
      const improvementRate = recentAccuracy - olderAccuracy;

      // Analyze study patterns
      const studyTimes = progress.map(p => new Date(p.created_at).getHours());
      const preferredTimes = [...new Set(studyTimes)]
        .sort((a, b) => {
          const countA = studyTimes.filter(t => t === a).length;
          const countB = studyTimes.filter(t => t === b).length;
          return countB - countA;
        })
        .slice(0, 3)
        .map(hour => `${hour}:00`);

      // Calculate session stats
      const sessions: { start: Date, questions: number, duration: number }[] = [];
      let currentSession = {
        start: new Date(progress[0]?.created_at),
        questions: 1,
        duration: 0
      };

      for (let i = 1; i < progress.length; i++) {
        const timeDiff = new Date(progress[i-1].created_at).getTime() - new Date(progress[i].created_at).getTime();
        if (timeDiff <= 30 * 60 * 1000) { // 30 minutes session break
          currentSession.questions++;
          currentSession.duration += timeDiff;
        } else {
          sessions.push(currentSession);
          currentSession = {
            start: new Date(progress[i].created_at),
            questions: 1,
            duration: 0
          };
        }
      }
      sessions.push(currentSession);

      const sessionDurationAvg = sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length / 60000; // in minutes
      const questionsPerSessionAvg = sessions.reduce((acc, s) => acc + s.questions, 0) / sessions.length;

      // Identify weak and strong areas
      const topicAccuracies = Object.entries(topicsAccuracy);
      const weakAreas = topicAccuracies
        .filter(([_, acc]) => acc < 70)
        .map(([topic]) => topic);
      const strongAreas = topicAccuracies
        .filter(([_, acc]) => acc >= 70)
        .map(([topic]) => topic);

      // Create analytics record
      const analytics = new UserAnalytics();
      analytics.user = req.user;
      analytics.performance_metrics = {
        overall_accuracy: overallAccuracy,
        topics_accuracy: topicsAccuracy,
        improvement_rate: improvementRate,
        study_patterns: {
          preferred_times: preferredTimes,
          session_duration_avg: sessionDurationAvg,
          questions_per_session_avg: questionsPerSessionAvg
        },
        weak_areas: weakAreas,
        strong_areas: strongAreas
      };

      // Generate learning insights
      analytics.learning_insights = {
        recommended_topics: weakAreas,
        difficulty_progression: improvementRate >= 0 ? "increasing" : "needs_improvement",
        optimal_study_time: preferredTimes[0],
        suggested_review_intervals: Object.fromEntries(
          weakAreas.map(topic => [topic, 24]) // Review weak topics daily
            .concat(strongAreas.map(topic => [topic, 72])) // Review strong topics every 3 days
        )
      };

      // Calculate engagement metrics
      const now = new Date();
      const lastActive = progress[0]?.created_at || now;
      const daysSinceStart = Math.floor((now.getTime() - new Date(progress[progress.length - 1]?.created_at || now).getTime()) / (24 * 60 * 60 * 1000));
      
      analytics.engagement_metrics = {
        study_streak: calculateStudyStreak(progress),
        total_study_time: sessions.reduce((acc, s) => acc + s.duration, 0) / 60000, // in minutes
        session_frequency: daysSinceStart > 0 ? sessions.length / daysSinceStart : 0,
        last_active: lastActive
      };

      await analyticsRepository.save(analytics);

      return res.json(analytics);
    } catch (error) {
      console.error("Generate analytics error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getUserAnalytics(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const analytics = await analyticsRepository
        .createQueryBuilder("analytics")
        .where("analytics.user_id = :userId", { userId: req.user.id })
        .orderBy("analytics.created_at", "DESC")
        .getOne();

      if (!analytics) {
        return res.status(404).json({ message: "No analytics found" });
      }

      return res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

function calculateStudyStreak(progress: UserProgress[]): number {
  if (progress.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set<string>();
  progress.forEach(p => {
    const date = new Date(p.created_at);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.toISOString());
  });

  const sortedDays = Array.from(uniqueDays)
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < sortedDays.length; i++) {
    const currentDay = sortedDays[i];
    const nextDay = i < sortedDays.length - 1 ? sortedDays[i + 1] : null;

    if (i === 0 && today.getTime() - currentDay.getTime() > oneDayMs) {
      break;
    }

    streak++;

    if (nextDay && currentDay.getTime() - nextDay.getTime() > oneDayMs) {
      break;
    }
  }

  return streak;
}
