export type ConversionFormat = 
  | 'summary' 
  | 'flashcards' 
  | 'study_guide' 
  | 'podcast_script' 
  | 'glossary' 
  | 'concept_map';

export type QuestionType = 
  | 'multiple_choice' 
  | 'true_false' 
  | 'fill_blanks' 
  | 'matching' 
  | 'scenario' 
  | 'open_ended';

export interface Flashcard {
  front: string;
  back: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
  example: string;
}

export interface ConceptMapNode {
  id: string;
  label: string;
  type?: string;
}

export interface ConceptMapEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ConceptMapData {
  mermaidCode: string;
  nodes: { id: string; label: string; description: string }[];
}

export interface ConvertedContent {
  id: string;
  title: string;
  sourceText: string;
  format: ConversionFormat;
  summaryData?: {
    mainTakeaway: string;
    sections: { heading: string; bullets: string[] }[];
  };
  flashcards?: Flashcard[];
  studyGuide?: {
    difficulty: 'Fácil' | 'Medio' | 'Difícil';
    sections: { topic: string; content: string }[];
  }[];
  podcastScript?: {
    scene: string;
    dialogue: { speaker: string; text: string; soundEffect?: string }[];
  };
  glossary?: GlossaryItem[];
  conceptMap?: ConceptMapData;
  createdAt: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // Used for multiple_choice
  correctAnswer: string; // Correct option, "true" or "false", correct blank answer, or comma-separated for matching
  explanation: string;
  points: number;
  scenarioText?: string; // Used for scenario/case-study based questions
  matchingPairs?: MatchingPair[]; // Used for matching column question
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  questions: Question[];
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Mixto';
  createdAt: string;
}

export type ExamDeliveryMode = 'practice' | 'real' | 'gamified';

export interface ExamResult {
  examId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  answers: { [questionId: string]: string | { [key: string]: string } };
  gradedFeedback?: { [questionId: string]: { score: number; feedback: string } }; // For open_ended AI feedback
}
