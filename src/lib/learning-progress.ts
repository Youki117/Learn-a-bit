import type { ArticleData } from '../types';
import type { LearningLevelState, LearningProgress } from '../types/learning-progress';
import { TOTAL_LEVELS } from '../types/learning-progress';

function createDefaultLevel(level: number): LearningLevelState {
  return {
    level,
    titleOptions: [],
    selectedTitle: null,
    articleData: null,
    completedAt: null,
  };
}

function clampCurrentLevel(level: number) {
  return Math.min(Math.max(level, 1), TOTAL_LEVELS + 1);
}

export { TOTAL_LEVELS };

export function createDefaultLearningProgress(domain: string): LearningProgress {
  return {
    domain,
    currentLevel: 1,
    totalLevels: TOTAL_LEVELS,
    levels: Array.from({ length: TOTAL_LEVELS }, (_, index) => createDefaultLevel(index + 1)),
  };
}

export function ensureProgressMatchesDomain(progress: LearningProgress | null, domain: string): LearningProgress {
  if (!progress || progress.domain !== domain) {
    return createDefaultLearningProgress(domain);
  }

  return progress;
}

export function upsertProgressInCollection(collection: LearningProgress[], nextProgress: LearningProgress) {
  const existingIndex = collection.findIndex((item) => item.domain === nextProgress.domain);

  if (existingIndex === -1) {
    return [...collection, nextProgress].sort((left, right) => left.domain.localeCompare(right.domain, 'zh-CN'));
  }

  return collection.map((item) => (item.domain === nextProgress.domain ? nextProgress : item));
}

export function removeProgressFromCollection(collection: LearningProgress[], domain: string) {
  return collection.filter((item) => item.domain !== domain);
}

export function resolveActiveDomainAfterDelete(collection: LearningProgress[], deletedDomain: string, previousActiveDomain: string) {
  const remaining = removeProgressFromCollection(collection, deletedDomain);

  if (previousActiveDomain !== deletedDomain) {
    return previousActiveDomain;
  }

  return remaining[0]?.domain ?? null;
}

export function applyTitleGroupsToProgress(progress: LearningProgress, titleGroups: string[][]): LearningProgress {
  return {
    ...progress,
    totalLevels: TOTAL_LEVELS,
    levels: progress.levels.map((levelState, index) => ({
      ...levelState,
      titleOptions: (titleGroups[index] ?? []).slice(0, 3),
    })),
  };
}

export function storeArticleForLevel(
  progress: LearningProgress,
  level: number,
  title: string,
  articleData: ArticleData,
): LearningProgress {
  return {
    ...progress,
    levels: progress.levels.map((levelState) =>
      levelState.level === level
        ? {
            ...levelState,
            selectedTitle: title,
            articleData,
          }
        : levelState,
    ),
  };
}

export function completeLevelInProgress(
  progress: LearningProgress,
  level: number,
  completedAt: string = new Date().toISOString(),
): LearningProgress {
  return {
    ...progress,
    currentLevel: clampCurrentLevel(Math.max(progress.currentLevel, level + 1)),
    levels: progress.levels.map((levelState) =>
      levelState.level === level
        ? {
            ...levelState,
            completedAt,
          }
        : levelState,
    ),
  };
}

export function findLevelState(progress: LearningProgress | null, level: number) {
  return progress?.levels.find((item) => item.level === level) ?? null;
}
