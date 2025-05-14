// src/stores/quizStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Question {
  id: number;
  text_content: string;
  respuesta_correcta: string;
  explanation?: string;
  parsedOptions: { letter: string; text: string }[];
  // Campos que añadiremos para el tracking
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  answeredTimestamp?: number | null;
}

export const useQuizStore = defineStore('quiz', () => {
  const allQuestions = ref<Question[]>([]); // Todas las preguntas cargadas
  const answeredQuestions = ref<Question[]>([]); // Preguntas que ya han sido respondidas en alguna sesión

  // --- Actions ---
  function setAllQuestions(questions: Question[]) {
    allQuestions.value = questions.map(q => ({ ...q, userAnswer: null, isCorrect: null, answeredTimestamp: null }));
  }

  function recordAnswer(questionId: number, userAnswer: string, isCorrect: boolean) {
    const questionInAll = allQuestions.value.find(q => q.id === questionId);
    if (questionInAll) {
      questionInAll.userAnswer = userAnswer;
      questionInAll.isCorrect = isCorrect;
      questionInAll.answeredTimestamp = Date.now();
    }

    const existingAnsweredIndex = answeredQuestions.value.findIndex(q => q.id === questionId);
    if (existingAnsweredIndex > -1) {
      // Actualizar si ya existe (ej. si se repite el quiz)
      answeredQuestions.value[existingAnsweredIndex] = { ...questionInAll };
    } else if (questionInAll) {
      answeredQuestions.value.push({ ...questionInAll });
    }
    // Aquí podrías persistir `answeredQuestions` a localStorage si quieres
  }

  function resetQuizState() {
     // No resetea answeredQuestions para mantener historial,
     // pero resetea el estado de las preguntas en allQuestions para un nuevo intento
    allQuestions.value = allQuestions.value.map(q => ({ ...q, userAnswer: null, isCorrect: null, answeredTimestamp: null }));
  }

  // --- Getters (Computed) ---
  const totalAnswered = computed(() => answeredQuestions.value.length);
  const totalCorrect = computed(() => answeredQuestions.value.filter(q => q.isCorrect).length);
  const totalIncorrect = computed(() => answeredQuestions.value.filter(q => q.isCorrect === false).length);

  const overallAccuracy = computed(() => {
    if (totalAnswered.value === 0) return 0;
    return (totalCorrect.value / totalAnswered.value) * 100;
  });

  // Podrías añadir más getters:
  // - Preguntas más falladas
  // - Progreso por tema (si las preguntas tienen categorías)

  return {
    allQuestions,
    answeredQuestions,
    setAllQuestions,
    recordAnswer,
    resetQuizState,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    overallAccuracy,
  }
})