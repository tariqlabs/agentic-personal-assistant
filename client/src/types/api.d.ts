/**
 * API response types
 */
export interface Exam {
  id: string;
  title: string;
  status: string;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  orderIndex: number;
}

export interface ExamAttemptResponse {
  attemptId: string;
  examId: string;
  totalQuestions: number;
  questions: ExamQuestion[];
}

export interface ExamResultsResponse {
  score: number;
  correctCount: number;
  totalQuestions: number;
  examTitle: string;
  results: Array<{
    examQuestionId: string;
    questionText: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
}
