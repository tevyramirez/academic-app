<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
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
        <div class="error-message" v-if="error">
          {{ error }}
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>
        <div class="form-footer">
          <RouterLink to="/register">¿No tienes cuenta? Regístrate</RouterLink>
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

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';
    console.log('Starting login...');
    const user = await authStore.login(email.value, password.value);
    console.log('Login response:', user);
    console.log('Auth store user:', authStore.user);
    if (user) {
      console.log('Attempting to navigate to /stats');
      // Use replace instead of push to prevent going back to login
      await router.replace('/stats');
      console.log('Navigation completed');
    } else {
      throw new Error('No se pudo iniciar sesión');
    }
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = err.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.login-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
}

.login-form {
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

.login-button {
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.login-button:disabled {
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
