import type { ArticleData } from '../types';

export const TOTAL_LEVELS = 10;

export type LearningLevelState = {
  level: number;
  titleOptions: string[];
  selectedTitle: string | null;
  articleData: ArticleData | null;
  completedAt: string | null;
};

export type LearningProgress = {
  domain: string;
  currentLevel: number;
  totalLevels: number;
  levels: LearningLevelState[];
};
