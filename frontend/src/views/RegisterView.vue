<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Crear Cuenta</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required 
            placeholder="Tu nombre"
          />
        </div>
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="tu@email.com"
          />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="••••••••"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="••••••••"
          />
        </div>
        <div class="error-message" v-if="error">
          {{ error }}
        </div>
        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>
        <div class="form-footer">
          <RouterLink to="/login">¿Ya tienes cuenta? Inicia sesión</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  try {
    error.value = '';
    
    // Validación de contraseña
    if (password.value.length < 8) {
      error.value = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (password.value !== confirmPassword.value) {
      error.value = 'Las contraseñas no coinciden';
      return;
    }

    loading.value = true;
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    });
    router.push('/');
  } catch (err: any) {
    console.error('Error during registration:', err);
    error.value = err.message || 'Error al crear la cuenta. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.register-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.register-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.form-group input {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background);
  color: var(--text-primary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.register-button {
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.register-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color);
  font-size: 0.9em;
  text-align: center;
}

.form-footer {
  text-align: center;
  font-size: 0.9em;
}

.form-footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
