export type AnswerType = 'paragraph' | 'mcq' | 'checkbox' | 'dropdown' | 'file' | 'linear' | 'date' | 'time';

export interface Option {
  id: number;
  text: string;
  score: number;
}

export interface Question {
  id: number;
  title: string;
  answer_type: AnswerType;
  required: boolean;
  order: number;
  options: Option[];
  reverse_scored?: boolean;
  construct?: string;
}

export interface Form {
  id: number;
  title: string;
  description: string;
  require_email: boolean;
  is_active: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface FormListItem {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  response_count?: number;
}

export interface ConstructResult {
  construct: string;
  average: number;
}

export interface FormResults {
  total_responses: number;
  construct_averages: Record<string, number>;
}
