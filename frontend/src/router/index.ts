import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import StatsView from '../views/StatsView.vue'
import FlashcardsView from '../views/FlashcardsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import SettingsView from '../views/SettingsView.vue'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { 
        title: 'Inicio',
        requiresAuth: true 
      }
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizView,
      meta: { 
        title: 'Práctica de Quiz',
        requiresAuth: true 
      }
    },
    {
      path: '/flashcards',
      name: 'flashcards',
      component: FlashcardsView,
      meta: { 
        title: 'Flashcards',
        requiresAuth: true 
      }
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { 
        title: 'Mis Estadísticas',
        requiresAuth: true 
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { 
        title: 'Configuración',
        requiresAuth: true 
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { 
        title: 'Iniciar Sesión',
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { 
        title: 'Crear Cuenta',
        requiresGuest: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'Acerca de' }
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  console.log(`Router navigation: ${from.path} -> ${to.path}`);
  const authStore = useAuthStore();
  const isAuthenticated = await authStore.checkAuth();
  console.log('Is authenticated:', isAuthenticated);
  console.log('Route requires auth:', to.meta.requiresAuth);
  console.log('Route requires guest:', to.meta.requiresGuest);

  // Update page title
  document.title = to.meta.title 
    ? `App Evaluación Docente - ${to.meta.title}` 
    : 'App Evaluación Docente';

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required
    console.log('Redirecting to login - auth required but not authenticated');
    return next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to stats if user is already logged in
    console.log('Redirecting to stats - guest route but user is authenticated');
    return next({ name: 'stats' });
  } else {
    next();
  }
});

export default router