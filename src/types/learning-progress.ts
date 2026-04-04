import type { ArticleData } from '../types';

export const TOTAL_LEVELS = 10;

export type PredictionSessionState = {
  selectedAnswer: number | null;
  wager: number;
  resolved: boolean;
  correct: boolean | null;
};

export type QuizSessionState = {
  currentQuestionIndex: number;
  answers: Array<number | null>;
  completed: boolean;
  correctAnswers: number | null;
  wrongPrompts: string[];
};

export type FeynmanSessionState = {
  draft: string;
  submitted: boolean;
  grade: string | null;
};

export type LearningSessionState = {
  status: 'idle' | 'lesson' | 'quiz' | 'feynman' | 'completed';
  lessonStep: number;
  prediction1: PredictionSessionState;
  prediction2: PredictionSessionState;
  quiz: QuizSessionState;
  feynman: FeynmanSessionState;
};

export type LearningLevelState = {
  level: number;
  titleOptions: string[];
  selectedTitle: string | null;
  articleData: ArticleData | null;
  completedAt: string | null;
  session: LearningSessionState;
};

export type LearningProgress = {
  domain: string;
  currentLevel: number;
  totalLevels: number;
  levels: LearningLevelState[];
};
