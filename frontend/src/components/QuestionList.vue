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
      <button @click="fetchQuestions" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="quizCompleted" class="quiz-summary card">
        <h2>¡Quiz Completado!</h2>
        <p class="score">Tu puntaje: {{ localScore }} de {{ totalLocalQuestions }}</p>
        <!-- Add more summary details if needed -->
         <div v-if="incorrectAnswers.length > 0" class="review-section">
            <h3>Preguntas para revisar:</h3>
            <ul>
                 <li v-for="item in currentQuizIncorrectAnswers" :key="item.id">
                   <span>Pregunta sobre: "{{ cleanQuestionText(item.text_content).substring(0, 50) }}..."</span>
                   <!-- Could add a button to jump back/show explanation -->
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
        <span class="progress-text">Pregunta {{ currentIndex + 1 }} de {{ totalQuestions }}</span>
      </div>

      <fieldset class="question-fieldset" :aria-labelledby="`question-title-${currentQuestion.id}`">
        <legend class="sr-only">Pregunta {{ currentIndex + 1 }}</legend>

        <p :id="`question-title-${currentQuestion.id}`" class="question-text">
            {{ cleanQuestionText(currentQuestion.text_content) }}
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
              'disabled': showFeedback // Disable after answering
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
              <!-- Visual indicators within the option -->
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
              Siguiente Pregunta
            </button>
        </div>
      </Transition>

    </div>

     <div v-else class="status-message">
      🤔 No hay preguntas disponibles en este momento.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useQuizStore } from '../stores/quizStore'; // Importar el store

const quizStore = useQuizStore(); // Instanciar el store

// State local del componente (para el quiz actual)
const localShuffledQuestions = ref([]);
const currentIndex = ref(0);
const selectedAnswer = ref('');
const showFeedback = ref(false);
const localScore = ref(0); // Puntaje de la sesión actual
const loading = ref(true);
const error = ref(null);
const quizCompleted = ref(false);
const nextButtonRef = ref(null);

const API_URL = 'http://localhost:3000/api/questions';

// Función para barajar un array (Algoritmo Fisher-Yates)
const shuffleArray = (array) => {
  if (!Array.isArray(array)) {
    console.warn("shuffleArray recibió algo que no es un array:", array);
    return []; // Devuelve un array vacío si la entrada no es un array
  }
  
  let newArray = [...array]; // Crear una copia para no modificar el array original
  for (let i = newArray.length - 1; i > 0; i--) {
    // Elegir un índice aleatorio desde 0 hasta i (incluido)
    const j = Math.floor(Math.random() * (i + 1));
    // Intercambiar el elemento en i con el elemento en j
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
// DENTRO DE TU QuestionList.vue
const parseOptions = (text) => {
  if (typeof text !== 'string' || !text.trim()) { // Comprobación más estricta
    console.warn("parseOptions recibió texto inválido o vacío, devolviendo array vacío:", text);
    return []; // Siempre devuelve un array
  }

  try {
    const regex = /(?:^|\n)\s*([A-D])\)\s*(.+?)(?=(?:\s*\n[A-D]\)|$))/gs;
    let matches = [...text.matchAll(regex)];

    if (matches.length === 0) {
      console.log("parseOptions: Regex principal no encontró coincidencias, intentando fallback para:", text.substring(0,100) + "...");
      const fallbackRegex = /([A-D])\)\s*(.+?)(?=(?:\s*[A-D]\)|$))/gs;
      matches = [...text.matchAll(fallbackRegex)]; // Reasignar a matches
    }

    if (matches.length === 0) {
      console.warn("parseOptions: Ninguna regex encontró opciones para:", text.substring(0,100) + "...");
      return []; // Si aún no hay coincidencias, devuelve array vacío
    }

    return matches.map((match) => {
      if (match && match.length > 2) { // Asegurar que match tiene los grupos esperados
        return {
          letter: match[1],
          text: match[2].trim(),
        };
      }
      console.warn("parseOptions: Match inválido encontrado:", match);
      return null; // O un objeto por defecto, luego filtrar nulos
    }).filter(option => option !== null); // Filtrar cualquier match inválido

  } catch (e) {
    console.error("Error dentro de parseOptions:", e, "para el texto:", text);
    return []; // En caso de cualquier error inesperado, devuelve array vacío
  }
};
// Función para eliminar las opciones (A, B, C, D) del enunciado de la pregunta
const cleanQuestionText = (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    return ''; // Si no hay texto o es inválido, devuelve string vacío
  }

  // Esta RegEx intenta eliminar líneas que empiezan con A), B), C), o D)
  // y todo lo que sigue en esa línea o hasta la siguiente opción o el final del string.
  // El `\s*` al principio maneja espacios/saltos de línea opcionales antes de la letra de la opción.
  // El `(?:^|\n)` asegura que la opción esté al inicio de una línea o del texto.
  // El `(?=(?:\s*\n[A-D]\)|$))` es un "positive lookahead" que asegura que la opción
  // es seguida por otra opción en una nueva línea o por el final del string,
  // ayudando a no cortar el enunciado si contiene "A)" accidentalmente.
  
  // Versión 1: Más específica para opciones al final o separadas por saltos de línea
  let cleanedText = text.replace(/(?:\n|^)\s*[A-D]\)\s*.*?(?=(?:\s*\n[A-D]\)|$))/gs, '');
  
  // Versión 2: Un fallback un poco más general si la anterior no limpia bien
  // Esta podría ser más agresiva si el enunciado contiene "A)" etc.
  if (cleanedText.trim() === text.trim()) { // Si la primera RegEx no hizo cambios significativos
      cleanedText = text.replace(/\s*[A-D]\)\s*(.+?)(?=(?:\s*[A-D]\)|$))/gs, '');
  }

  return cleanedText.trim(); // Elimina espacios extra al principio/final
};

// Computed Properties LOCALES al componente
const totalLocalQuestions = computed(() => localShuffledQuestions.value.length);
const currentQuestion = computed(() => {
    if (!loading.value && localShuffledQuestions.value.length > 0 && currentIndex.value < totalLocalQuestions.value) {
        return localShuffledQuestions.value[currentIndex.value];
    }
    return null;
});
const progressPercentage = computed(() => { /* ... (sin cambios, usa totalLocalQuestions) ... */ });
const isCorrect = computed(() => { /* ... (sin cambios, usa currentQuestion y selectedAnswer) ... */ });

// NO necesitamos incorrectAnswers localmente si lo manejamos en el store

// --- Methods ---
const fetchQuestions = async () => {
  loading.value = true;
  error.value = null;
  quizCompleted.value = false;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(` ${response.status} ${response.statusText}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) throw new Error("API response format unexpected.");
    console.log(data)
    const fetchedQuestions = data.data.map(q => {
        const options = parseOptions(q.text_content);
        const correctAnswer = q.respuesta_correcta?.toUpperCase();
        const validLetters = options.map(opt => opt.letter);
        if (!correctAnswer || !validLetters.includes(correctAnswer)) {
            console.warn(`Invalid correct answer for Q ID ${q.id}`);
            return { ...q, parsedOptions: options, isValid: false, explanation: q.explanation || null };
        }
        return { ...q, parsedOptions: options, isValid: true, explanation: q.explanation || "Explicación no disponible." };
    }).filter(q => q.isValid && q.parsedOptions.length > 0);

    if (fetchedQuestions.length === 0) throw new Error("No valid questions found.");
    console.log("Preguntas obtenidas:", fetchedQuestions);
    quizStore.setAllQuestions(fetchedQuestions); // Guardar en el store
    startLocalQuiz();

  } catch (err) {
    console.error("Error fetching questions:", err);
    error.value = err.message || 'Could not load questions.';
  } finally {
    loading.value = false;
  }
};

const startLocalQuiz = () => {
    localShuffledQuestions.value = shuffleArray([...quizStore.allQuestions]); // Usar copia del store
    currentIndex.value = 0;
    localScore.value = 0;
    selectedAnswer.value = '';
    showFeedback.value = false;
    quizCompleted.value = false;
    quizStore.resetQuizState(); // Resetea userAnswer, isCorrect en el store para esta sesión
};

const handleAnswerSelection = () => {
    if (!selectedAnswer.value || showFeedback.value) return;

    const questionObj = currentQuestion.value;
    if (!questionObj) return;

    const correct = selectedAnswer.value === questionObj.respuesta_correcta;
    showFeedback.value = true;
    if (correct) {
        localScore.value++;
    }

    // REGISTRAR RESPUESTA EN EL STORE
    quizStore.recordAnswer(questionObj.id, selectedAnswer.value, correct);

    nextTick(() => {
        nextButtonRef.value?.focus();
    });
};

const nextQuestion = () => {
  if (currentIndex.value < totalLocalQuestions.value - 1) {
    currentIndex.value++;
    selectedAnswer.value = '';
    showFeedback.value = false;
     nextTick(() => {
         const firstRadio = document.querySelector('.question-card input[type="radio"]');
         firstRadio?.focus();
     });
  } else {
    quizCompleted.value = true;
  }
};

const restartQuiz = () => {
    startLocalQuiz();
};

onMounted(() => {
  fetchQuestions().then(
    () => {
      console.log("Preguntas cargadas y barajadas. Las preguntas son:", localShuffledQuestions.value);
    }
  )
});

// Para el template, `score` ahora es `localScore`
// y `totalQuestions` es `totalLocalQuestions`
// El `incorrectAnswers` para el resumen del quiz actual se puede calcular al final:
const currentQuizIncorrectAnswers = computed(() => {
    if (!quizCompleted.value) return [];
    // Filtra de las preguntas de *esta sesión* las que fueron respondidas incorrectamente
    return localShuffledQuestions.value.filter(q => {
        const answeredInStore = quizStore.allQuestions.find(sq => sq.id === q.id);
        return answeredInStore && answeredInStore.userAnswer && !answeredInStore.isCorrect;
    });
});
</script>


<style>

</style>