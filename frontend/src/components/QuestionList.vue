<template>
  <div class="quiz-container">
    <div v-if="loading" class="status-message loading">
      <div class="skeleton-loader">
        <div class="skeleton skeleton-text skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
      </div>
      Cargando Quiz...
    </div>

    <div v-else-if="error" class="status-message error">
      <p>⚠️ Ocurrió un error al cargar el quiz:</p>
      <p class="error-details">{{ error }}</p>
      <button @click="fetchAndStartQuiz" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="quizCompleted" class="quiz-summary card">
        <h2>¡Quiz Completado!</h2>
        <p class="score">Tu puntaje: {{ localScore }} de {{ currentQuizQuestions.length }}</p>
         <div v-if="currentQuizIncorrectAnswers.length > 0" class="review-section">
            <h3>Preguntas para revisar:</h3>
            <ul>
                 <li v-for="item in currentQuizIncorrectAnswers" :key="item.id">
                   <span>Pregunta sobre: "{{ item.questionText.substring(0, 50) }}..."</span>
                </li>
            </ul>
         </div>
        <button @click="restartQuiz" class="quiz-button primary">Volver a Intentar</button>
    </div>

    <div v-else-if="currentQuestion" class="question-card card" :key="currentQuestion.id">
      <div class="progress-indicator">
        <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">Pregunta {{ currentIndex + 1 }} de {{ currentQuizQuestions.length }}</span>
      </div>

      <fieldset class="question-fieldset" :aria-labelledby="`question-title-${currentQuestion.id}`">
        <legend class="sr-only">Pregunta {{ currentIndex + 1 }}</legend>
        <p :id="`question-title-${currentQuestion.id}`" class="question-text">
            {{ currentQuestion.questionText }}
        </p>

        <div class="options-container" role="radiogroup" :aria-labelledby="`question-title-${currentQuestion.id}`" :aria-describedby="showFeedback ? `feedback-${currentQuestion.id}` : undefined">
          <div
            v-for="option in currentQuestion.parsedOptions"
            :key="option.letter"
            class="option"
            :class="{
              'selected': selectedAnswer === option.letter,
              'correct': showFeedback && option.letter === currentQuestion.respuesta_correcta,
              'incorrect': showFeedback && selectedAnswer === option.letter && option.letter !== currentQuestion.respuesta_correcta,
              'disabled': showFeedback
            }"
          >
            <input
              type="radio"
              :id="`q${currentQuestion.id}-opt${option.letter}`"
              :name="`question-${currentQuestion.id}`"
              :value="option.letter"
              v-model="selectedAnswer"
              @change="handleAnswerSelection"
              :disabled="showFeedback"
              class="sr-only"
              :aria-describedby="option.letter === currentQuestion.respuesta_correcta && showFeedback ? `correct-indicator-${currentQuestion.id}` : undefined"
            />
            <label :for="`q${currentQuestion.id}-opt${option.letter}`" class="option-label">
              <span class="option-letter">{{ option.letter }}</span>
              <span class="option-text">{{ option.text }}</span>
              <span v-if="showFeedback && option.letter === currentQuestion.respuesta_correcta" class="feedback-icon correct-icon">✅<span :id="`correct-indicator-${currentQuestion.id}`" class="sr-only">Respuesta Correcta</span></span>
              <span v-if="showFeedback && selectedAnswer === option.letter && option.letter !== currentQuestion.respuesta_correcta" class="feedback-icon incorrect-icon">❌<span class="sr-only">Respuesta Incorrecta Seleccionada</span></span>
            </label>
          </div>
        </div>
      </fieldset>

      <Transition name="fade">
        <div v-if="showFeedback" class="feedback-container" :id="`feedback-${currentQuestion.id}`" aria-live="polite">
           <p v-if="isCorrect" class="feedback-text correct-text">
               ¡Correcto!
           </p>
           <p v-else class="feedback-text incorrect-text">
               Incorrecto. La respuesta correcta era la {{ currentQuestion.respuesta_correcta }}.
           </p>
           <p v-if="currentQuestion.explanation" class="explanation-text">
               <strong>Explicación:</strong> {{ currentQuestion.explanation }}
           </p>
           <button ref="nextButtonRef" @click="nextQuestion" class="quiz-button primary next-button">
              {{ currentIndex === currentQuizQuestions.length - 1 ? 'Ver Resultados' : 'Siguiente Pregunta' }}
            </button>
        </div>
      </Transition>
    </div>

     <div v-else class="status-message">
      🤔 No hay preguntas disponibles en este momento.
       <button v-if="!loading && !error" @click="fetchAndStartQuiz" class="quiz-button primary" style="margin-top: 15px;">
        Cargar Preguntas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import type { ProcessedQuestion } from '../types/question';
import { apiService } from '../services/api';

const quizStore = useQuizStore();

const currentQuizQuestions = ref<ProcessedQuestion[]>([]); // Questions for the current quiz session
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const showFeedback = ref(false);
const localScore = ref(0);
const loading = ref(true);
const error = ref<string | null>(null);
const quizCompleted = ref(false);
const nextButtonRef = ref<HTMLButtonElement | null>(null);

const shuffleArray = <T>(array: T[]): T[] => {
  if (!Array.isArray(array)) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const currentQuestion = computed<ProcessedQuestion | null>(() => {
  if (currentQuizQuestions.value.length > 0 && currentIndex.value < currentQuizQuestions.value.length) {
    return currentQuizQuestions.value[currentIndex.value];
  }
  return null;
});

const progressPercentage = computed(() => {
  if (currentQuizQuestions.value.length === 0) return 0;
  return ((currentIndex.value + (showFeedback.value ? 1: 0)) / currentQuizQuestions.value.length) * 100;
});

const isCorrect = computed(() => {
  if (!currentQuestion.value || !selectedAnswer.value) return false;
  return selectedAnswer.value === currentQuestion.value.respuesta_correcta;
});


const fetchAndStartQuiz = async () => {
  loading.value = true;
  error.value = null;
  try {
    if (quizStore.allQuestions.length === 0) { // Fetch only if not already in store
      const questionsFromApi = await apiService.getQuestions();
      quizStore.setAllQuestions(questionsFromApi);
    }
    if (quizStore.allQuestions.length === 0) {
        throw new Error("No se encontraron preguntas válidas para el quiz.");
    }
    startLocalQuiz();
  } catch (err: Error | unknown) {
    console.error("Error fetching or starting quiz:", err);
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar las preguntas.';
  } finally {
    loading.value = false;
  }
};

const startLocalQuiz = () => {
  quizStore.resetQuizState(); // Reset answers/status for questions in the store for a new attempt
  currentQuizQuestions.value = shuffleArray([...quizStore.allQuestions]); // Use a shuffled copy for this quiz session
  currentIndex.value = 0;
  localScore.value = 0;
  selectedAnswer.value = null;
  showFeedback.value = false;
  quizCompleted.value = false;
  error.value = null; // Clear previous errors
  if (currentQuizQuestions.value.length === 0 && !loading.value) {
      error.value = "No hay preguntas disponibles para iniciar el quiz."
  }
};

const handleAnswerSelection = () => {
  if (!selectedAnswer.value || showFeedback.value || !currentQuestion.value) return;

  showFeedback.value = true;
  const questionObject = currentQuestion.value;
  const correct = selectedAnswer.value === questionObject.respuesta_correcta;

  if (correct) {
    localScore.value++;
  }
  quizStore.recordAnswer(questionObject.id, selectedAnswer.value, correct);

  nextTick(() => {
    nextButtonRef.value?.focus();
  });
};

const nextQuestion = () => {
  if (currentIndex.value < currentQuizQuestions.value.length - 1) {
    currentIndex.value++;
    selectedAnswer.value = null;
    showFeedback.value = false;
    nextTick(() => {
      const firstRadio = document.querySelector('.question-card input[type="radio"]') as HTMLElement | null;
      firstRadio?.focus();
    });
  } else {
    quizCompleted.value = true;
  }
};

const restartQuiz = () => {
  startLocalQuiz();
};

const currentQuizIncorrectAnswers = computed(() => {
  if (!quizCompleted.value) return [];
  return currentQuizQuestions.value.filter(q => {
    const answeredInStore = quizStore.allQuestions.find(sq => sq.id === q.id);
    return answeredInStore && answeredInStore.userAnswer && !answeredInStore.isCorrect;
  });
});

onMounted(() => {
  fetchAndStartQuiz();
});

// Watch for changes in allQuestions (e.g., if another part of the app loads them)
// and restart the local quiz if it hasn't started properly.
watch(() => quizStore.allQuestions, (newVal) => {
    if (newVal.length > 0 && currentQuizQuestions.value.length === 0 && !loading.value && !quizCompleted.value) {
        console.log("Questions loaded in store, starting local quiz.");
        startLocalQuiz();
    }
}, { deep: true });

</script>

<style>
/* Styles from base.css are used globally */
</style>
