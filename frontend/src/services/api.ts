import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { QuestionFromApi } from '../types/question';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  validateStatus: function (status) {
    // Consider only network errors and 500+ as errors
    return status < 500;
  },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface ApiResponse {
  success: boolean;
  count?: number;
  data?: unknown;
  error?: string;
  errors?: Array<{ property: string; constraints: Record<string, string> }>;
}

async function handleAxiosResponse<T>(response: AxiosResponse): Promise<T> {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  const errorPayload = response.data as ApiResponse;
  const errorMessage = errorPayload?.error || `HTTP error ${response.status}: ${response.statusText}`;
  throw new Error(errorMessage);
}

// Question endpoints
export async function getQuestions(): Promise<QuestionFromApi[]> {
  const response = await api.get('/questions');
  const result = await handleAxiosResponse<{success: boolean, data: QuestionFromApi[]}>(response);
  return result.data; // Extract the actual questions array from the wrapper
}

export async function getQuestionsByTopic(topic: string): Promise<QuestionFromApi[]> {
  const response = await api.get(`/questions/topic/${topic}`);
  const result = await handleAxiosResponse<{success: boolean, data: QuestionFromApi[]}>(response);
  return result.data; // Extract the actual questions array from the wrapper
}

// Analytics endpoints
export async function getUserAnalytics() {
  const response = await api.get('/v1/analytics');
  return handleAxiosResponse<any>(response);
}

export async function generateUserAnalytics() {
  const response = await api.post('/v1/analytics/generate');
  return handleAxiosResponse<any>(response);
}

export async function getProgressStats() {
  const response = await api.get('/v1/progress/stats');
  return handleAxiosResponse<any>(response);
}

// Auth endpoints
export async function register(data: { name: string; email: string; password: string }) {
  const response = await api.post('/auth/register', data);
  return handleAxiosResponse<any>(response);
}

export async function login(data: { email: string; password: string }) {
  const response = await api.post('/auth/login', data);
  return handleAxiosResponse<any>(response);
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return handleAxiosResponse<void>(response);
}

// User endpoints
export async function getUserProfile() {
  const response = await api.get('/user/profile');
  return handleAxiosResponse<any>(response);
}

export async function updateUserProfile(data: { name: string; email: string }) {
  const response = await api.put('/user/profile', data);
  return handleAxiosResponse<any>(response);
}

export async function updateUserPassword(data: { currentPassword: string; newPassword: string }) {
  const response = await api.put('/user/password', data);
  return handleAxiosResponse<void>(response);
}

export async function getUserPreferences() {
  const response = await api.get('/user/preferences');
  return handleAxiosResponse<any>(response);
}

export async function updateUserPreferences(data: any) {
  const response = await api.put('/user/preferences', data);
  return handleAxiosResponse<any>(response);
}

export default {
  getQuestions,
  getQuestionsByTopic,
  getUserAnalytics,
  generateUserAnalytics,
  getProgressStats,
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserPreferences,
  updateUserPreferences,
};
