<template>
  <div class="flashcards-view-container">
    <h1>Flashcards de Repaso</h1>
    <div v-if="quizStore.allQuestions.length === 0 && !loading" class="no-questions-message">
      <p>No hay preguntas cargadas para mostrar como flashcards.</p>
      <p>Intenta primero realizar un quiz para cargar las preguntas.</p>
      <RouterLink to="/quiz" class="quiz-button primary">Ir al Quiz</RouterLink>
    </div>

    <div v-else-if="loading" class="status-message loading">
      Cargando flashcards...
    </div>

    <div v-else-if="currentFlashcard" class="flashcard-navigation">
      <FlashcardItem :question="currentFlashcard" :key="currentFlashcard.id" />
      <div class="navigation-buttons">
        <button @click="prevFlashcard" :disabled="currentCardIndex === 0" class="quiz-button">
          Anterior
        </button>
        <span>{{ currentCardIndex + 1 }} / {{ flashcardSet.length }}</span>
        <button @click="nextFlashcard" :disabled="currentCardIndex === flashcardSet.length - 1" class="quiz-button">
          Siguiente
        </button>
      </div>
      <button @click="shuffleFlashcards" class="quiz-button primary shuffle-button">
        Mezclar Tarjetas
      </button>
    </div>
     <div v-else-if="!loading && quizStore.allQuestions.length > 0 && flashcardSet.length === 0" class="no-questions-message">
      <p>¡Todas las flashcards vistas! Puedes mezclarlas de nuevo o volver al inicio.</p>
      <button @click="shuffleFlashcards" class="quiz-button primary">Mezclar de Nuevo</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import FlashcardItem from '../components/FlashcardItem.vue';
import type { Question as QuizQuestion } from '../stores/quizStore'; // Asegúrate que Question en quizStore es exportada
import { RouterLink } from 'vue-router';


const quizStore = useQuizStore();
const flashcardSet = ref<QuizQuestion[]>([]);
const currentCardIndex = ref(0);
const loading = ref(true); // Para simular carga si es necesario

const shuffleArray = <T>(array: T[]): T[] => {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const currentFlashcard = computed(() => {
  if (flashcardSet.value.length > 0 && currentCardIndex.value < flashcardSet.value.length) {
    return flashcardSet.value[currentCardIndex.value];
  }
  return null;
});

function setupFlashcards() {
  if (quizStore.allQuestions.length > 0) {
    flashcardSet.value = shuffleArray([...quizStore.allQuestions]);
    currentCardIndex.value = 0;
  }
  loading.value = false;
}

function prevFlashcard() {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
  }
}

function nextFlashcard() {
  if (currentCardIndex.value < flashcardSet.value.length - 1) {
    currentCardIndex.value++;
  }
}

function shuffleFlashcards() {
    loading.value = true;
    setupFlashcards();
}

// Observar si las preguntas en el store cambian (ej. después de fetch en QuizView)
watch(() => quizStore.allQuestions, (newQuestions) => {
  if (newQuestions.length > 0 && flashcardSet.value.length === 0) { // Solo si no se han inicializado aún
    setupFlashcards();
  }
}, { immediate: true }); // immediate: true para que se ejecute al montar si ya hay preguntas


onMounted(() => {
  // Si allQuestions está vacío, es posible que el usuario haya ido directamente aquí.
  // Idealmente, fetchQuestions debería ser una acción en el store y llamarse aquí si es necesario.
  // Por simplicidad, asumimos que el QuizView ya las ha cargado.
  if (quizStore.allQuestions.length === 0) {
    // Podrías mostrar un mensaje o intentar cargar preguntas aquí.
    // Por ahora, se mostrará "No hay preguntas cargadas".
    console.log("No hay preguntas en el store para flashcards, ir a Quiz primero.");
    loading.value = false;
  } else {
    setupFlashcards();
  }
});
</script>

<style scoped>
.flashcards-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 25px; /* Espacio entre elementos */
}
.flashcards-view-container h1 {
    margin-bottom: 10px; /* Menos margen inferior para h1 */
}

.no-questions-message {
  text-align: center;
  padding: 20px;
  background-color: var(--secondary-light);
  border-radius: var(--border-radius);
  max-width: 500px;
}
.no-questions-message p {
  margin-bottom: 15px;
}

.flashcard-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px; /* O el ancho que prefieras para el contenedor de la flashcard */
  gap: 20px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 400px; /* Ancho para los botones */
  margin-top: 10px; /* Espacio sobre los botones */
}

.navigation-buttons span {
  font-weight: 500;
  color: var(--text-secondary);
}

.shuffle-button {
    margin-top: 10px;
}
</style>