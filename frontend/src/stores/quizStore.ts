import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseOptions, cleanQuestionText } from '../utils/quizUtils';
import type { QuestionFromApi, ProcessedQuestion } from '@/types/question';

const ANSWERED_QUESTIONS_STORAGE_KEY = 'studyAppAnsweredQuestions';

export const useQuizStore = defineStore('quiz', () => {
  const allQuestions = ref<ProcessedQuestion[]>([]); // Stores all *processed* questions
  const answeredQuestions = ref<ProcessedQuestion[]>(loadAnsweredQuestions()); // Tracks historical answers

  function loadAnsweredQuestions(): ProcessedQuestion[] {
    try {
      const stored = localStorage.getItem(ANSWERED_QUESTIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProcessedQuestion[];
        // Convert date strings back to Date objects if necessary
        return parsed.map(q => ({
            ...q,
            created_at: new Date(q.created_at),
            updated_at: new Date(q.updated_at)
        }));
      }
    } catch (error) {
      console.error('Failed to load answered questions from localStorage:', error);
    }
    return [];
  }

  function persistAnsweredQuestions() {
    try {
      localStorage.setItem(ANSWERED_QUESTIONS_STORAGE_KEY, JSON.stringify(answeredQuestions.value));
    } catch (error) {
      console.error('Failed to save answered questions to localStorage:', error);
    }
  }

  function setAllQuestions(questionsFromApi: QuestionFromApi[]) {
    const processed = questionsFromApi
      .map(q => {
        if (!q.respuesta_correcta) { // Filter out questions without a correct answer
          console.warn(`Question ID ${q.id} has no respuesta_correcta, skipping.`);
          return null;
        }
        const options = parseOptions(q.text_content);
        if (options.length === 0) { // Filter out questions where options couldn't be parsed
             console.warn(`Question ID ${q.id} could not parse options, skipping.`);
             return null;
        }
        const validLetters = options.map(opt => opt.letter);
        if (!validLetters.includes(q.respuesta_correcta.toUpperCase())) {
            console.warn(`Correct answer "${q.respuesta_correcta}" for Q ID ${q.id} is not among parsed options: ${validLetters.join(', ')}. Skipping.`);
            return null;
        }

        return {
          id: q.id,
          original_text_content: q.text_content,
          questionText: cleanQuestionText(q.text_content),
          parsedOptions: options,
          respuesta_correcta: q.respuesta_correcta.toUpperCase(),
          explanation: q.explanation || undefined,
          raw_source: q.raw_source,
          created_at: new Date(q.created_at),
          updated_at: new Date(q.updated_at),
          userAnswer: null,
          isCorrect: null,
          answeredTimestamp: null,
        };
      })
      .filter(q => q !== null) as ProcessedQuestion[];
    
    allQuestions.value = processed;
  }

  function recordAnswer(questionId: number, userAnswer: string, isCorrect: boolean) {
    const questionInAll = allQuestions.value.find(q => q.id === questionId);
    if (questionInAll) {
      questionInAll.userAnswer = userAnswer;
      questionInAll.isCorrect = isCorrect;
      questionInAll.answeredTimestamp = Date.now();

      // Update or add to historical answeredQuestions
      const existingAnsweredIndex = answeredQuestions.value.findIndex(aq => aq.id === questionId);
      const updatedAnsweredQuestion = { ...questionInAll }; // Capture current state

      if (existingAnsweredIndex > -1) {
        answeredQuestions.value.splice(existingAnsweredIndex, 1, updatedAnsweredQuestion);
      } else {
        answeredQuestions.value.push(updatedAnsweredQuestion);
      }
      persistAnsweredQuestions();
    }
  }

  function resetQuizState() {
    // Resets the current quiz attempt status on `allQuestions`
    allQuestions.value = allQuestions.value.map(q => ({
      ...q,
      userAnswer: null,
      isCorrect: null,
      answeredTimestamp: null,
    }));
    // `answeredQuestions` (historical data) is not reset here by design
  }

  const totalAnswered = computed(() => answeredQuestions.value.length);
  const totalCorrect = computed(() => answeredQuestions.value.filter(q => q.isCorrect).length);
  const totalIncorrect = computed(() => answeredQuestions.value.filter(q => q.isCorrect === false).length);

  const overallAccuracy = computed(() => {
    if (totalAnswered.value === 0) return 0;
    return (totalCorrect.value / totalAnswered.value) * 100;
  });

  return {
    allQuestions,
    answeredQuestions,
    setAllQuestions,
    recordAnswer,
    resetQuizState,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    overallAccuracy
  };
});
