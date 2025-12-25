
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: Question[];
  createdAt: number;
}

export type AppState = 'IDLE' | 'GENERATING' | 'QUIZ' | 'RESULT';
