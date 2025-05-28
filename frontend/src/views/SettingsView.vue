<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Configuración de Usuario</h1>
      <p class="subtitle">Gestiona tu perfil y preferencias</p>
    </div>

    <div class="settings-grid">
      <!-- Perfil -->
      <div class="settings-section">
        <h2>Perfil</h2>
        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input 
              type="text" 
              id="name" 
              v-model="profile.name" 
              required
            />
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              v-model="profile.email" 
              required
              disabled
            />
          </div>
          <button type="submit" :disabled="loading.profile">
            {{ loading.profile ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>

      <!-- Seguridad -->
      <div class="settings-section">
        <h2>Seguridad</h2>
        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label for="currentPassword">Contraseña Actual</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="security.currentPassword" 
              required
            />
          </div>
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="security.newPassword" 
              required
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="security.confirmPassword" 
              required
            />
          </div>
          <button type="submit" :disabled="loading.security">
            {{ loading.security ? 'Actualizando...' : 'Actualizar Contraseña' }}
          </button>
        </form>
      </div>

      <!-- Preferencias -->
      <div class="settings-section wide">
        <h2>Preferencias</h2>
        <div class="preferences-grid">
          <div class="preference-item">
            <label class="switch">
              <input 
                type="checkbox" 
                v-model="preferences.emailNotifications"
                @change="updatePreferences"
              />
              <span class="slider"></span>
            </label>
            <div class="preference-text">
              <span>Notificaciones por Email</span>
              <small>Recibe actualizaciones sobre tu progreso</small>
            </div>
          </div>
          <div class="preference-item">
            <label class="switch">
              <input 
                type="checkbox" 
                v-model="preferences.darkMode"
                @change="updatePreferences"
              />
              <span class="slider"></span>
            </label>
            <div class="preference-text">
              <span>Modo Oscuro</span>
              <small>Cambia el tema de la aplicación</small>
            </div>
          </div>
          <div class="preference-item">
            <label class="switch">
              <input 
                type="checkbox" 
                v-model="preferences.soundEffects"
                @change="updatePreferences"
              />
              <span class="slider"></span>
            </label>
            <div class="preference-text">
              <span>Efectos de Sonido</span>
              <small>Sonidos al responder preguntas</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

const authStore = useAuthStore();
const userStore = useUserStore();

const profile = ref({
  name: '',
  email: ''
});

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const preferences = ref({
  emailNotifications: false,
  darkMode: false,
  soundEffects: true
});

const loading = ref({
  profile: false,
  security: false
});

const error = ref({
  profile: '',
  security: '',
  preferences: ''
});

onMounted(async () => {
  // Load user data
  const userData = await userStore.getCurrentUser();
  profile.value = {
    name: userData.name,
    email: userData.email
  };

  // Load preferences
  const userPrefs = await userStore.getUserPreferences();
  preferences.value = {
    ...preferences.value,
    ...userPrefs
  };
});

async function updateProfile() {
  try {
    loading.value.profile = true;
    error.value.profile = '';
    await userStore.updateProfile(profile.value);
  } catch (err: any) {
    error.value.profile = err.message;
  } finally {
    loading.value.profile = false;
  }
}

async function updatePassword() {
  try {
    if (security.value.newPassword !== security.value.confirmPassword) {
      error.value.security = 'Las contraseñas no coinciden';
      return;
    }

    loading.value.security = true;
    error.value.security = '';
    await userStore.updatePassword(security.value);
    security.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (err: any) {
    error.value.security = err.message;
  } finally {
    loading.value.security = false;
  }
}

async function updatePreferences() {
  try {
    await userStore.updatePreferences(preferences.value);
  } catch (err: any) {
    error.value.preferences = err.message;
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 40px;
}

.settings-header h1 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.subtitle {
  color: var(--text-secondary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.settings-section {
  background-color: var(--card-background);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.settings-section.wide {
  grid-column: 1 / -1;
}

.settings-section h2 {
  color: var(--text-primary);
  margin-bottom: 25px;
  font-size: 1.5em;
}

.settings-form {
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

.form-group input:disabled {
  background-color: var(--disabled-background);
  cursor: not-allowed;
}

button {
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: var(--background);
  border-radius: var(--border-radius);
}

.preference-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preference-text span {
  color: var(--text-primary);
  font-weight: 500;
}

.preference-text small {
  color: var(--text-secondary);
  font-size: 0.85em;
}

/* Switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
