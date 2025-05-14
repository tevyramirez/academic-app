<template>
  <div class="quiz-view-container">
    <QuestionList />
  </div>
</template>

<script setup>
import QuestionList from '../components/QuestionList.vue';
</script>

<style scoped>
.quiz-view-container {
  /* Puedes añadir estilos específicos para esta vista si es necesario */
  padding-top: 20px;
}
</style>