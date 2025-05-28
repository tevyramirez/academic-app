<template>
  <div class="stats-view-container card">
    <h1>Mis Estadísticas Generales</h1>
    <div v-if="loading" class="loading-message">
      <p>Cargando estadísticas...</p>
    </div>
    <div v-else-if="errorMsg" class="error-message">
      <p>{{ errorMsg }}</p>
      <button @click="loadData" class="primary-button">Reintentar</button>
    </div>
    <div v-else-if="!hasStats" class="no-stats-message">
      <p>Aún no has respondido ninguna pregunta. ¡Comienza un quiz para ver tu progreso!</p>
      <RouterLink to="/quiz" class="quiz-button primary">Empezar Quiz</RouterLink>
    </div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalAnswers }}</span>
          <span class="stat-label">Preguntas Respondidas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value correct-value">{{ stats.correctAnswers }}</span>
          <span class="stat-label">Respuestas Correctas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value incorrect-value">{{ stats.incorrectAnswers }}</span>
          <span class="stat-label">Respuestas Incorrectas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value accuracy-value">{{ stats.accuracy.toFixed(1) }}%</span>
          <span class="stat-label">Precisión General</span>
        </div>
      </div>

      <div class="insights-grid" v-if="analytics">
        <div class="insight-item">
          <h3>Racha de Estudio</h3>
          <div class="insight-value">{{ analytics.engagement_metrics.study_streak }} días</div>
        </div>
        <div class="insight-item">
          <h3>Tiempo Total de Estudio</h3>
          <div class="insight-value">{{ Math.round(analytics.engagement_metrics.total_study_time / 60) }} horas</div>
        </div>
        <div class="insight-item">
          <h3>Mejor Horario</h3>
          <div class="insight-value">{{ analytics.learning_insights.optimal_study_time }}</div>
        </div>
        <div class="insight-item">
          <h3>Temas Recomendados</h3>
          <div class="insight-topics">
            <span v-for="topic in analytics.learning_insights.recommended_topics" :key="topic" class="topic-tag">
              {{ topic }}
            </span>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-container">
          <h2>Rendimiento General</h2>
          <canvas ref="accuracyChartEl"></canvas>
        </div>
        
        <div class="chart-container">
          <h2>Progreso en el Tiempo</h2>
          <canvas ref="progressChartEl"></canvas>
        </div>

        <div class="chart-container wide">
          <h2>Dominio por Tema</h2>
          <canvas ref="topicsChartEl"></canvas>
        </div>

        <div class="chart-container wide">
          <h2>Patrones de Estudio</h2>
          <canvas ref="studyPatternsChartEl"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { onMounted, ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { 
  Chart, 
  DoughnutController,
  LineController,
  RadarController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

// Register Chart.js components
Chart.register(
  DoughnutController,
  LineController,
  RadarController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  BarElement,
  Tooltip,
  Legend
);

const analyticsStore = useAnalyticsStore();
const { analytics, progressStats, isLoading: loading, error: errorMsg } = storeToRefs(analyticsStore);

// Chart canvas references
const accuracyChartEl = ref<HTMLCanvasElement | null>(null);
const progressChartEl = ref<HTMLCanvasElement | null>(null);
const topicsChartEl = ref<HTMLCanvasElement | null>(null);
const studyPatternsChartEl = ref<HTMLCanvasElement | null>(null);

// Active chart instances
const charts = ref<{ [key: string]: Chart | null }>({
  accuracy: null,
  progress: null,
  topics: null,
  studyPatterns: null
});

// Computed stats
const hasStats = computed(() => analytics.value !== null && progressStats.value !== null);

const stats = computed(() => {
  const overall = progressStats.value?.overall || {
    total_answers: 0,
    correct_answers: 0,
    accuracy_percentage: 0
  };

  return {
    totalAnswers: overall.total_answers,
    correctAnswers: overall.correct_answers,
    incorrectAnswers: overall.total_answers - overall.correct_answers,
    accuracy: overall.accuracy_percentage
  };
});

async function loadData() {
  await analyticsStore.fetchAnalytics();
}

function updateCharts() {
  if (!hasStats.value) return;

  // Cleanup old charts
  Object.values(charts.value).forEach(chart => chart?.destroy());

  // Accuracy Chart
  if (accuracyChartEl.value) {
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Correctas', 'Incorrectas'],
        datasets: [{
          label: 'Rendimiento',
          data: [stats.value.correctAnswers, stats.value.incorrectAnswers],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };
    charts.value.accuracy = new Chart(accuracyChartEl.value, config);
  }

  // Progress Chart
  if (progressChartEl.value && analyticsStore.progressData) {
    charts.value.progress = new Chart(progressChartEl.value, {
      type: 'line',
      data: analyticsStore.progressData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            max: 100
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  // Topics Chart
  if (topicsChartEl.value && analyticsStore.topicAccuracyData) {
    charts.value.topics = new Chart(topicsChartEl.value, {
      type: 'radar',
      data: analyticsStore.topicAccuracyData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            beginAtZero: true
          }
        }
      }
    });
  }

  // Study Patterns Chart
  if (studyPatternsChartEl.value && analyticsStore.studyPatternsData) {
    charts.value.studyPatterns = new Chart(studyPatternsChartEl.value, {
      type: 'bar',
      data: analyticsStore.studyPatternsData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

watch([analytics, progressStats], () => {
  updateCharts();
});

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.stats-view-container {
  padding: 30px;
}

.stats-view-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
  color: var(--text-secondary);
}

.error-message {
  color: var(--error-color);
}

.primary-button {
  display: inline-block;
  padding: 12px 24px;
  margin-top: 16px;
  border-radius: var(--border-radius);
  border: none;
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: var(--primary-hover);
}

.no-stats-message {
  text-align: center;
  padding: 20px;
  background-color: var(--secondary-light);
  border-radius: var(--border-radius);
}

.no-stats-message p {
  margin-bottom: 20px;
  font-size: 1.1em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  background-color: var(--card-background);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.stat-value.correct-value { color: var(--success-color); }
.stat-value.incorrect-value { color: var(--error-color); }
.stat-value.accuracy-value { color: var(--primary-hover); }

.stat-label {
  font-size: 0.95em;
  color: var(--text-secondary);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.insight-item {
  background-color: var(--card-background);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.insight-item h3 {
  font-size: 1em;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.insight-value {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
}

.insight-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.chart-container {
  background-color: var(--card-background);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  height: 300px;
}

.chart-container.wide {
  grid-column: 1 / -1;
  height: 400px;
}

.chart-container h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2em;
  color: var(--text-primary);
}

canvas {
  width: 100% !important;
  height: calc(100% - 50px) !important;
}

.quiz-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: bold;
  background-color: var(--primary-color);
  color: white;
  transition: background-color 0.2s;
}

.quiz-button:hover {
  background-color: var(--primary-hover);
}
</style>