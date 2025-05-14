<template>
  <div class="app-layout">
    <NavBar />
    <div class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue'; // Crearemos este
</script>

<style>
/* Asegúrate que tus estilos globales de base.css y main.css se importan en main.ts */

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color); /* Aplicar color de fondo global aquí */
}

.main-content {
  flex-grow: 1;
  padding: 0px 20px 20px 20px; /* Ajustar padding si es necesario, NavBar ya tiene el suyo */
  /* max-width: 1280px; /* O el que definas para tu contenido principal */
  /* margin: 0 auto; /* Centrar contenido si tiene max-width */
}

/* Transiciones de ruta */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>