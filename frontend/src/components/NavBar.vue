<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/" class="brand-link">
        <span>Prepara Evaluación</span>
      </RouterLink>
    </div>
    <ul class="navbar-links">
      <li><RouterLink to="/" active-class="active-link">Inicio</RouterLink></li>
      <li><RouterLink to="/quiz" active-class="active-link">Quiz</RouterLink></li>
      <li><RouterLink to="/flashcards" active-class="active-link">Flashcards</RouterLink></li>
      <li><RouterLink to="/stats" active-class="active-link">Estadísticas</RouterLink></li>
      <!-- <li><RouterLink to="/about" active-class="active-link">Acerca de</RouterLink></li> -->
    </ul>
    <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu" :aria-expanded="isMobileMenuOpen">
      ☰
    </button>
     <ul class="navbar-links-mobile" :class="{ open: isMobileMenuOpen }">
      <li><RouterLink to="/" active-class="active-link" @click="closeMobileMenu">Inicio</RouterLink></li>
      <li><RouterLink to="/quiz" active-class="active-link" @click="closeMobileMenu">Quiz</RouterLink></li>
      <li><RouterLink to="/flashcards" active-class="active-link" @click="closeMobileMenu">Flashcards</RouterLink></li>
      <li><RouterLink to="/stats" active-class="active-link" @click="closeMobileMenu">Estadísticas</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
.navbar {
  background-color: var(--card-background);
  padding: 10px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 60px; /* Fixed height */
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.3em;
}

.logo {
  height: 35px;
  margin-right: 10px;
}

.navbar-links {
  list-style: none;
  display: flex;
  gap: 25px;
  margin: 0;
  padding: 0;
}

.navbar-links li a {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar-links li a:hover {
  background-color: var(--primary-light);
  color: var(--primary-hover);
}

.navbar-links li a.active-link {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}

.menu-toggle {
  display: none; /* Hidden by default, shown in media query */
  background: none;
  border: none;
  font-size: 1.8em;
  color: var(--primary-color);
  cursor: pointer;
}

.navbar-links-mobile {
  display: none; /* Hidden by default */
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 60px; /* Height of navbar */
  left: 0;
  right: 0;
  background-color: var(--card-background);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  align-items: center;
  z-index: 999; /* Below navbar but above content */
}

.navbar-links-mobile.open {
  display: flex;
}

.navbar-links-mobile li {
  width: 100%;
  text-align: center;
}

.navbar-links-mobile li a {
  display: block;
  padding: 15px 0;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
}
.navbar-links-mobile li:last-child a {
  border-bottom: none;
}

.navbar-links-mobile li a:hover {
  background-color: var(--primary-light);
  color: var(--primary-hover);
}

.navbar-links-mobile li a.active-link {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
}


@media (max-width: 768px) {
  .navbar-links {
    display: none; /* Hide desktop links */
  }
  .menu-toggle {
    display: block; /* Show hamburger menu */
  }
}
</style>