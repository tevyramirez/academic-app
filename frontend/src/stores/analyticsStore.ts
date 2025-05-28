import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserAnalytics, generateUserAnalytics, getProgressStats } from '../services/api';

interface DailyStats {
  date: string;
  answers: number;
  correct_answers: number;
  avg_response_time: number;
}

interface AnalyticsData {
  performance_metrics: {
    overall_accuracy: number;
    topics_accuracy: Record<string, number>;
    improvement_rate: number;
    study_patterns: {
      preferred_times: string[];
      session_duration_avg: number;
      questions_per_session_avg: number;
    };
    weak_areas: string[];
    strong_areas: string[];
  };
  learning_insights: {
    recommended_topics: string[];
    difficulty_progression: 'increasing' | 'needs_improvement';
    optimal_study_time: string;
    suggested_review_intervals: Record<string, number>;
  };
  engagement_metrics: {
    study_streak: number;
    total_study_time: number;
    session_frequency: number;
    last_active: string;
  };
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const analytics = ref<AnalyticsData | null>(null);
  const progressStats = ref<{ overall: any; daily: DailyStats[] } | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties for stats view
  const topicAccuracyData = computed(() => {
    if (!analytics.value?.performance_metrics.topics_accuracy) return null;
    
    const data = analytics.value.performance_metrics.topics_accuracy;
    return {
      labels: Object.keys(data),
      datasets: [{
        label: 'Dominio por Tema (%)',
        data: Object.values(data),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 159, 64, 1)'
      }]
    };
  });

  const progressData = computed(() => {
    if (!progressStats.value?.daily) return null;

    const dailyStats = progressStats.value.daily;
    return {
      labels: dailyStats.map(stat => new Date(stat.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Precisión (%)',
          data: dailyStats.map(stat => (stat.correct_answers / stat.answers * 100)),
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: 'Preguntas Respondidas',
          data: dailyStats.map(stat => stat.answers),
          borderColor: 'rgba(153, 102, 255, 1)',
          tension: 0.1,
          yAxisID: 'y1'
        }
      ]
    };
  });

  const studyPatternsData = computed(() => {
    if (!analytics.value?.performance_metrics.study_patterns) return null;

    const patterns = analytics.value.performance_metrics.study_patterns;
    const preferredTimes = patterns.preferred_times;
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const data = hours.map(hour => preferredTimes.includes(hour) ? 1 : 0);

    return {
      labels: hours,
      datasets: [{
        label: 'Horarios Preferidos',
        data: data,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };
  });

  // Actions
  async function fetchAnalytics() {
    isLoading.value = true;
    error.value = null;
    
    const analyticsResult = await getUserAnalytics();
    const statsResult = await getProgressStats();
    
    if (analyticsResult.error) {
      error.value = analyticsResult.error;
      console.warn('Analytics fetch warning:', analyticsResult.error);
    } else {
      analytics.value = analyticsResult;
    }
    
    if (statsResult.error) {
      if (!error.value) error.value = statsResult.error;
      console.warn('Progress stats fetch warning:', statsResult.error);
    } else {
      progressStats.value = statsResult;
    }
    
    isLoading.value = false;
  }

  async function generateAnalytics() {
    isLoading.value = true;
    error.value = null;
    
    const result = await generateUserAnalytics();
    if (result.error) {
      error.value = result.error;
      console.warn('Analytics generation warning:', result.error);
    } else {
      analytics.value = result;
    }
    
    // Still try to refresh data even if there was an error
    await fetchAnalytics();
    isLoading.value = false;
  }

  return {
    analytics,
    progressStats,
    isLoading,
    error,
    topicAccuracyData,
    progressData,
    studyPatternsData,
    fetchAnalytics,
    generateAnalytics,
  };
});
