import { requireNonEmptyString } from './validators';

export const TOTAL_LEVELS = 10;

export type StoredArticleData = {
  part1: string;
  part2: string;
  part3: string;
  chunkPlan: string[];
  prediction1: { question: string; options: string[]; correctIndex: number };
  prediction2: { question: string; options: string[]; correctIndex: number };
  quiz: { question: string; options: string[]; correctIndex: number }[];
};

export type LearningLevelState = {
  level: number;
  titleOptions: string[];
  selectedTitle: string | null;
  articleData: StoredArticleData | null;
  completedAt: string | null;
};

export type LearningProgress = {
  domain: string;
  currentLevel: number;
  totalLevels: number;
  levels: LearningLevelState[];
};

type LearningProgressRow = {
  current_level?: unknown;
  total_levels?: unknown;
  levels?: unknown;
};

function clampCurrentLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(value), 1), TOTAL_LEVELS + 1);
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeQuestion(value: unknown) {
  if (!value || typeof value !== 'object') {
    return { question: '', options: ['', '', '', ''], correctIndex: 0 };
  }

  const record = value as Record<string, unknown>;
  const options = Array.isArray(record.options)
    ? record.options.filter((item): item is string => typeof item === 'string').slice(0, 4)
    : [];

  while (options.length < 4) {
    options.push('');
  }

  const correctIndex =
    typeof record.correctIndex === 'number' && Number.isInteger(record.correctIndex) && record.correctIndex >= 0 && record.correctIndex <= 3
      ? record.correctIndex
      : 0;

  return {
    question: typeof record.question === 'string' ? record.question : '',
    options,
    correctIndex,
  };
}

function normalizeArticleData(value: unknown): StoredArticleData | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    part1: typeof record.part1 === 'string' ? record.part1 : '',
    part2: typeof record.part2 === 'string' ? record.part2 : '',
    part3: typeof record.part3 === 'string' ? record.part3 : '',
    chunkPlan: Array.isArray(record.chunkPlan)
      ? record.chunkPlan.filter((item): item is string => typeof item === 'string')
      : [],
    prediction1: normalizeQuestion(record.prediction1),
    prediction2: normalizeQuestion(record.prediction2),
    quiz: Array.isArray(record.quiz)
      ? record.quiz.map((item) => normalizeQuestion(item))
      : [],
  };
}

function createDefaultLevel(level: number): LearningLevelState {
  return {
    level,
    titleOptions: [],
    selectedTitle: null,
    articleData: null,
    completedAt: null,
  };
}

function normalizeLevel(value: unknown, level: number): LearningLevelState {
  const fallback = createDefaultLevel(level);

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  return {
    level,
    titleOptions: normalizeStringList(record.titleOptions),
    selectedTitle: typeof record.selectedTitle === 'string' ? record.selectedTitle.trim() || null : null,
    articleData: normalizeArticleData(record.articleData),
    completedAt: typeof record.completedAt === 'string' ? record.completedAt : null,
  };
}

export function createDefaultLearningProgress(domain: string): LearningProgress {
  const safeDomain = requireNonEmptyString(domain, 'domain');

  return {
    domain: safeDomain,
    currentLevel: 1,
    totalLevels: TOTAL_LEVELS,
    levels: Array.from({ length: TOTAL_LEVELS }, (_, index) => createDefaultLevel(index + 1)),
  };
}

export function normalizeLearningProgress(domain: string, row?: LearningProgressRow | null): LearningProgress {
  const fallback = createDefaultLearningProgress(domain);

  if (!row) {
    return fallback;
  }

  const levels = Array.isArray(row.levels) ? row.levels : [];

  return {
    domain: fallback.domain,
    currentLevel: clampCurrentLevel(row.current_level),
    totalLevels: TOTAL_LEVELS,
    levels: Array.from({ length: TOTAL_LEVELS }, (_, index) => normalizeLevel(levels[index], index + 1)),
  };
}

export function toLearningProgressRow(userId: string, progress: LearningProgress) {
  return {
    user_id: requireNonEmptyString(userId, 'userId'),
    domain: requireNonEmptyString(progress.domain, 'domain'),
    current_level: clampCurrentLevel(progress.currentLevel),
    total_levels: TOTAL_LEVELS,
    levels: progress.levels.map((level, index) => normalizeLevel(level, index + 1)),
  };
}
