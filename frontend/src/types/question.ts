import type { ParsedOption } from '../utils/quizUtils';


interface QuestionFromApi {
  id: number;
  text_content: string;
  respuesta_correcta: string | null;
  raw_source?: string | null;
  explanation?: string | null;
  created_at: string; // Dates from API are strings
  updated_at: string;
}

interface QuestionsFromApi {
    questions: QuestionFromApi[];
}
interface ProcessedQuestion {
  id: number;
  original_text_content: string;
  questionText: string; // Cleaned question statement for display
  parsedOptions: ParsedOption[];
  respuesta_correcta: string; // Non-null for a usable quiz question
  explanation?: string | null;
  raw_source?: string | null;
  created_at: Date;
  updated_at: Date;

  // UI/Quiz state fields
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  answeredTimestamp?: number | null;
}

export type { QuestionFromApi, QuestionsFromApi, ProcessedQuestion };