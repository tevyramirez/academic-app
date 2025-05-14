// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Será nuestro Dashboard
import QuizView from '../views/QuizView.vue' // Moveremos QuestionList aquí
import StatsView from '../views/StatsView.vue' // Nueva vista para estadísticas
import FlashcardsView from '../views/FlashcardsView.vue' // Nueva vista para Flashcards

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Inicio' }
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizView,
      meta: { title: 'Práctica de Quiz' }
    },
    {
      path: '/flashcards',
      name: 'flashcards',
      component: FlashcardsView,
      meta: { title: 'Flashcards' }
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { title: 'Mis Estadísticas' }
    },
    {
      path: '/about', // Mantenemos la vista About por si la usas
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'Acerca de' }
    },
  ],
})

// Actualizar título de la página dinámicamente
router.afterEach((to) => {
  document.title = to.meta.title ? `App Evaluación Docente - ${to.meta.title}` : 'App Evaluación Docente';
});

export default router