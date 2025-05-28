<template>
  <div class="flashcards-view-container">
    <h1>Flashcards de Repaso</h1>
    <div v-if="!quizStore.allQuestions || quizStore.allQuestions.length === 0 && !loading" class="no-questions-message">
      <p>No hay preguntas cargadas para mostrar como flashcards.</p>
      <p>Intenta primero realizar un quiz para cargar las preguntas.</p>
      <RouterLink to="/quiz" class="quiz-button primary">Ir al Quiz</RouterLink>
    </div>

    <div v-else-if="loading" class="status-message loading">
      Cargando flashcards...
    </div>
    
    <div v-else-if="flashcardSet.length === 0 && quizStore.allQuestions.length > 0" class="no-questions-message">
      <p>¡Todas las flashcards vistas! Puedes mezclarlas de nuevo o volver al inicio.</p>
      <button @click="shuffleFlashcards" class="quiz-button primary">Mezclar de Nuevo</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuizStore} from '../stores/quizStore';
import type { ProcessedQuestion } from '../types/question';
import FlashcardItem from '../components/FlashcardItem.vue';
import { RouterLink } from 'vue-router';
import { apiService } from '../services/api'; // Import apiService

const quizStore = useQuizStore();
const flashcardSet = ref<ProcessedQuestion[]>([]);
const currentCardIndex = ref(0);
const loading = ref(true);

const shuffleArray = <T>(array: T[]): T[] => {
  if (!Array.isArray(array)) return [];
  const newArray = [...array];
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
    flashcardSet.value = shuffleArray([...quizStore.allQuestions]); // Use processed questions
    currentCardIndex.value = 0;
  }
  loading.value = false;
}

async function ensureQuestionsLoaded() {
  loading.value = true;
  if (quizStore.allQuestions.length === 0) {
    try {
      console.log("FlashcardsView: No questions in store, fetching...");
      const questionsFromApi = await apiService.getQuestions();
      quizStore.setAllQuestions(questionsFromApi); // This will process and store them
    } catch (error) {
      console.error("FlashcardsView: Failed to fetch questions:", error);
      // Handle error display if needed
    }
  }
  setupFlashcards(); // This will now use questions from the store
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
    loading.value = true; // Show loading state while shuffling
    // No need to re-fetch, just re-shuffle from the store's allQuestions
    setupFlashcards();
}

// Watch for questions being loaded into the store
watch(() => quizStore.allQuestions, (newQuestions) => {
  if (newQuestions.length > 0 && flashcardSet.value.length === 0) { // Setup if not already done
    setupFlashcards();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  ensureQuestionsLoaded();
});
</script>

<style scoped>
.flashcards-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 25px;
}
.flashcards-view-container h1 {
    margin-bottom: 10px;
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
  max-width: 600px;
  gap: 20px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-top: 10px;
}

.navigation-buttons span {
  font-weight: 500;
  color: var(--text-secondary);
}

.shuffle-button {
    margin-top: 10px;
}

.status-message.loading { /* Ensure this style is available or define it */
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
}
</style>
