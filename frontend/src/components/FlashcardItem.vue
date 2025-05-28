<template>
  <div class="flashcard" :class="{ 'is-flipped': isFlipped }" @click="flipCard">
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <p>{{ question.questionText }}</p>
      </div>
      <div class="flashcard-back">
        <p class="answer-label">Respuesta:</p>
        <p class="answer-text">{{ correctAnswerText }}</p>
        <div v-if="question.explanation" class="explanation">
          <p class="explanation-label">Explicación:</p>
          <p>{{ question.explanation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProcessedQuestion } from '../stores/quizStore'; // Using the processed question type

const props = defineProps<{
  question: ProcessedQuestion;
}>();

const isFlipped = ref(false);

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

const correctAnswerText = computed(() => {
  const correctOption = props.question.parsedOptions.find(opt => opt.letter === props.question.respuesta_correcta);
  return correctOption ? `${correctOption.letter}) ${correctOption.text}` : 'Respuesta no encontrada';
});

</script>

<style scoped>
.flashcard {
  background-color: transparent;
  width: 100%;
  max-width: 500px;
  min-height: 250px;
  aspect-ratio: 16 / 10;
  perspective: 1000px;
  cursor: pointer;
  border-radius: var(--border-radius);
  font-family: var(--font-family);
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: var(--card-shadow);
  border-radius: var(--border-radius);
}

.flashcard.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px; /* Added padding */
  border-radius: var(--border-radius);
  box-sizing: border-box;
  overflow-y: auto;
}

.flashcard-front {
  background-color: var(--card-background);
  color: var(--text-primary);
  font-size: 1.2em;
}

.flashcard-back {
  background-color: var(--primary-light);
  color: var(--text-primary);
  transform: rotateY(180deg);
  text-align: left;
  align-items: flex-start;
}

.flashcard-back .answer-label,
.flashcard-back .explanation-label {
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 5px;
  font-size: 0.9em;
}
.flashcard-back .answer-text {
  font-size: 1.1em;
  margin-bottom: 15px;
}
.flashcard-back .explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
  width: 100%;
  font-size: 0.9em;
}
</style>
