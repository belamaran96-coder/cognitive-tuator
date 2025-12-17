export interface User {
  id: string;
  username: string;
}

export interface DocumentIntelligence {
  core_themes: string[];
  implicit_assumptions: string[];
  cross_section_links: string[];
  difficulty_map: Record<string, number>; // Topic -> 1-10 difficulty
}

export interface Rubric {
  key_points: string[];
  depth_markers: string[];
  common_misconceptions: string[];
}

export interface Question {
  id: string;
  question_text: string;
  targets: string[]; // e.g., "analysis", "synthesis"
  rubric: Rubric; // HIDDEN from user
}

export interface LearnerMemory {
  strengths: string[];
  gaps: string[];
  feedback_preference: 'concise' | 'detailed';
  history: {
    questionId: string;
    score: number;
  }[];
}

export interface EvaluationResult {
  score_band: 'Novice' | 'Competent' | 'Proficient' | 'Master' | 'Visionary';
  score_numerical: number; // 0-100
  strength_analysis: string;
  weakness_analysis: string;
  personalized_suggestion: string; // Actionable advice, NOT a new question
  updated_memory: Partial<LearnerMemory>;
}

export interface SessionData {
  id: string;
  userId: string;
  timestamp: number;
  title: string;
  documentText: string;
  intelligence: DocumentIntelligence;
  questions: Question[];
  currentQuestionId: string | null;
  learnerMemory: LearnerMemory;
  evaluations: Record<string, EvaluationResult>;
}

export interface AppState {
  stage: 'upload' | 'analyzing' | 'dashboard' | 'evaluating';
  documentText: string | null;
  intelligence: DocumentIntelligence | null;
  questions: Question[];
  currentQuestionId: string | null;
  learnerMemory: LearnerMemory;
  evaluations: Record<string, EvaluationResult>;
}

export const INITIAL_MEMORY: LearnerMemory = {
  strengths: [],
  gaps: [],
  feedback_preference: 'detailed',
  history: []
};