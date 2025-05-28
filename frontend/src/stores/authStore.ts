import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  async function login(email: string, password: string) {
    try {
      console.log('Auth store login attempt for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login API response:', response.data);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', token.value ?? '');
      // Update Authorization header for subsequent requests
      if (token.value) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      }
      console.log('Auth store state updated:', { user: user.value, token: !!token.value });
      return response.data.user;
    } catch (error: any) {
      console.error('Auth store login error:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async function register(data: { name: string; email: string; password: string }) {
    try {
      const response = await api.post('/auth/register', data);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', token.value ?? '');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => Object.values(err.constraints || {}).join(', '))
          .join('. ');
        throw new Error(validationErrors);
      }
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  async function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    console.log('CheckAuth - stored token exists:', !!storedToken);
    console.log('CheckAuth - current user state:', user.value);
    
    if (storedToken) {
      try {
        token.value = storedToken;
        const response = await api.get('/auth/profile');
        user.value = response.data;
        console.log('CheckAuth - API response successful, user:', response.data);
        return true;
      } catch (error) {
        console.log('CheckAuth - API call failed:', error);
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        return false;
      }
    }
    
    // If we have a user in state but no token, we're authenticated
    if (user.value && token.value) {
      console.log('CheckAuth - using existing state, user:', user.value);
      return true;
    }
    
    console.log('CheckAuth - not authenticated');
    return false;
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    checkAuth,
  };
});
