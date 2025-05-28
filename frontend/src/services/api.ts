import type { QuestionFromApi } from '../types/question'; // Adjust path if your store is elsewhere

const API_BASE_URL = import.meta.env.VITE_API_URL||'/api'; // Vite proxy will handle this during development

interface ApiResponse {
  success: boolean;
  count?: number;
  data?: unknown;
  error?: string;
  errors?: Array<{ property: string; constraints: Record<string, string> }>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorPayload: ApiResponse | null = null;
    try {
      errorPayload = await response.json();
    } catch {
      // Ignore if response is not JSON
    }
    const errorMessage = errorPayload?.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  const payload: ApiResponse = await response.json();
  if (!payload.success) {
    const errorsString = payload.errors ? payload.errors.map(e => `${e.property}: ${Object.values(e.constraints).join(', ')}`).join('; ') : '';
    throw new Error(payload.error || errorsString || 'API request failed');
  }
  return payload.data as T;
}

export const apiService = {
  async getQuestions(): Promise<QuestionFromApi[]> {
    const response = await fetch(`${API_BASE_URL}/questions`);
    return handleResponse<QuestionFromApi[]>(response);
  },

  // Example for createPregunta if you need it in the future
  // async createPregunta(preguntaData: { text_content: string; raw_source?: string }): Promise<QuestionFromApi> {
  //   const response = await fetch(`${API_BASE_URL}/questions/raw`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(preguntaData),
  //   });
  //   return handleResponse<QuestionFromApi>(response);
  // }
};
