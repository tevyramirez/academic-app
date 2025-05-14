<template>
  <footer class="app-footer">
    <p>© {{ currentYear }} App Preparación Evaluación Docente. Todos los derechos reservados.</p>
    <p>Desarrollado con ❤️ para los profesores de Chile.</p>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  background-color: var(--text-primary); /* Fondo oscuro para contraste */
  color: var(--background-color); /* Texto claro */
  text-align: center;
  padding: 20px;
  margin-top: auto; /* Empuja el footer hacia abajo */
  font-size: 0.9em;
}

.app-footer p {
  margin: 5px 0;
}
</style>