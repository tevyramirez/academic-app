import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

interface UserProfile {
  name: string;
  email: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null);
  const preferences = ref<UserPreferences>({
    emailNotifications: false,
    darkMode: false,
    soundEffects: true,
  });

  async function getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      profile.value = response.data;
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener datos del usuario');
    }
  }

  async function updateProfile(data: UserProfile) {
    try {
      const response = await api.put('/user/profile', data);
      profile.value = response.data;
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }

  async function updatePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      await api.put('/user/password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
    }
  }

  async function getUserPreferences() {
    try {
      const response = await api.get('/user/preferences');
      preferences.value = response.data;
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preferencias');
    }
  }

  async function updatePreferences(data: UserPreferences) {
    try {
      const response = await api.put('/user/preferences', data);
      preferences.value = response.data;
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar preferencias');
    }
  }

  return {
    profile,
    preferences,
    getCurrentUser,
    updateProfile,
    updatePassword,
    getUserPreferences,
    updatePreferences,
  };
});
