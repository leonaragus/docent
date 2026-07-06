export interface ChapterMarker {
  id: string;
  title: string;
  timestamp: string; // "MM:SS"
  seconds: number;
}

export interface Recording {
  id: string;
  name: string;
  size: string;
  date: string;
  url: string;
  blob: Blob;
  chapters?: ChapterMarker[];
  transcriptionText?: string;
  srtText?: string;
  quizQuestions?: QuizQuestion[];
  oracleExam?: any;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // Para multiple_choice
  correctAnswer: string;
  explanation: string;
}

export interface LessonPlanResult {
  lessonPlan: string;
  teleprompterScript: string;
  suggestedChapters: string[];
}

export interface ClassFeedback {
  id: string;
  shared_class_id: string;
  rating: number;
  comment: string;
  created_at: string;
}
