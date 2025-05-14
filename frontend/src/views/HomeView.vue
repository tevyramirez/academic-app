<template>
  <div class="dashboard-container">
    <h1>Panel de Preparación</h1>
    <p class="welcome-message">
      ¡Bienvenido/a! Aquí podrás acceder a todas las herramientas para prepararte.
    </p>

    <div class="dashboard-grid">
      <RouterLink to="/quiz" class="dashboard-card">
        <div class="card-icon">🧠</div>
        <h2>Práctica de Quiz</h2>
        <p>Pon a prueba tus conocimientos con preguntas de selección múltiple.</p>
      </RouterLink>

      <RouterLink to="/flashcards" class="dashboard-card">
        <div class="card-icon">🗂️</div>
        <h2>Flashcards</h2>
        <p>Repasa conceptos clave de forma rápida y efectiva.</p>
      </RouterLink>

      <RouterLink to="/stats" class="dashboard-card">
        <div class="card-icon">📊</div>
        <h2>Mis Estadísticas</h2>
        <p>Visualiza tu progreso y áreas de mejora.</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica futura del dashboard aquí
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  text-align: center;
}

.welcome-message {
  font-size: 1.1em;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.dashboard-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 25px;
  box-shadow: var(--card-shadow);
  text-decoration: none;
  color: var(--text-primary);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.dashboard-card h2 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.dashboard-card p {
  font-size: 0.95em;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>