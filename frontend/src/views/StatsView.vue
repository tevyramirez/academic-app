<template>
  <div class="stats-view-container card">
    <h1>Mis Estadísticas Generales</h1>
    <div v-if="quizStore.totalAnswered === 0" class="no-stats-message">
      <p>Aún no has respondido ninguna pregunta. ¡Comienza un quiz para ver tu progreso!</p>
      <RouterLink to="/quiz" class="quiz-button primary">Empezar Quiz</RouterLink>
    </div>
    <div v-else class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ quizStore.totalAnswered }}</span>
        <span class="stat-label">Preguntas Respondidas</span>
      </div>
      <div class="stat-item">
        <span class="stat-value correct-value">{{ quizStore.totalCorrect }}</span>
        <span class="stat-label">Respuestas Correctas</span>
      </div>
      <div class="stat-item">
        <span class="stat-value incorrect-value">{{ quizStore.totalIncorrect }}</span>
        <span class="stat-label">Respuestas Incorrectas</span>
      </div>
      <div class="stat-item">
        <span class="stat-value accuracy-value">{{ quizStore.overallAccuracy.toFixed(1) }}%</span>
        <span class="stat-label">Precisión General</span>
      </div>
    </div>

    <!-- Aquí podrías añadir gráficos. Ejemplo con Chart.js si lo instalas -->
    <div class="charts-container" v-if="quizStore.totalAnswered > 0">
        <h2>Visualización</h2>
        <!-- <canvas id="accuracyChart"></canvas> -->
        <p><i>Gráficos más detallados próximamente (ej. rendimiento por tema, historial).</i></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';
import { RouterLink } from 'vue-router';
import { onMounted } from 'vue';
import Chart from 'chart.js/auto'; // Si decides usar Chart.js

const quizStore = useQuizStore();

// Ejemplo si usaras Chart.js

onMounted(() => {
  if (quizStore.totalAnswered > 0 && document.getElementById('accuracyChart')) {
    new Chart(
      document.getElementById('accuracyChart') as HTMLCanvasElement,
      {
        type: 'doughnut',
        data: {
          labels: ['Correctas', 'Incorrectas'],
          datasets: [
            {
              label: 'Rendimiento',
              data: [quizStore.totalCorrect, quizStore.totalIncorrect],
              backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)'
              ],
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      }
    );
  }
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
.stat-value.accuracy-value { color: var(--primary-hover); } /* Un color diferente para precisión */

.stat-label {
  font-size: 0.95em;
  color: var(--text-secondary);
}

.charts-container {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.charts-container h2 {
  text-align: center;
  margin-bottom: 20px;
}


#accuracyChart {
  max-width: 400px;
  max-height: 400px;
  margin: 0 auto;
}

</style>