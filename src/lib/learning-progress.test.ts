import test from 'node:test';
import assert from 'node:assert/strict';
import type { ArticleData } from '../types';
import {
  TOTAL_LEVELS,
  applyTitleGroupsToProgress,
  completeLevelInProgress,
  createDefaultLearningProgress,
  ensureProgressMatchesDomain,
  storeArticleForLevel,
  upsertProgressInCollection,
  removeProgressFromCollection,
  resolveActiveDomainAfterDelete,
} from './learning-progress';

function createArticle(title: string): ArticleData {
  return {
    part1: `${title}-part1`,
    part2: `${title}-part2`,
    part3: `${title}-part3`,
    chunkPlan: ['a', 'b', 'c'],
    prediction1: { question: 'q1', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
    prediction2: { question: 'q2', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
    quiz: [{ question: 'q3', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }],
  };
}

test('applyTitleGroupsToProgress stores one title group per level', () => {
  const progress = createDefaultLearningProgress('科学');
  const titleGroups = Array.from({ length: TOTAL_LEVELS }, (_, levelIndex) => [
    `标题 ${levelIndex + 1}A`,
    `标题 ${levelIndex + 1}B`,
    `标题 ${levelIndex + 1}C`,
  ]);

  const next = applyTitleGroupsToProgress(progress, titleGroups);

  assert.equal(next.levels.length, TOTAL_LEVELS);
  assert.deepEqual(next.levels[0].titleOptions, ['标题 1A', '标题 1B', '标题 1C']);
  assert.deepEqual(next.levels[1].titleOptions, ['标题 2A', '标题 2B', '标题 2C']);
});

test('storeArticleForLevel saves the selected title and article without advancing the level', () => {
  const progress = createDefaultLearningProgress('科学');
  const article = createArticle('标题 1A');

  const next = storeArticleForLevel(progress, 1, '标题 1A', article);

  assert.equal(next.currentLevel, 1);
  assert.equal(next.levels[0].selectedTitle, '标题 1A');
  assert.equal(next.levels[0].articleData?.part1, '标题 1A-part1');
  assert.equal(next.levels[1].selectedTitle, null);
});

test('completeLevelInProgress advances only the current domain progress', () => {
  const progress = storeArticleForLevel(createDefaultLearningProgress('科学'), 1, '标题 1A', createArticle('标题 1A'));

  const next = completeLevelInProgress(progress, 1, '2026-03-24T15:00:00.000Z');

  assert.equal(next.currentLevel, 2);
  assert.equal(next.levels[0].completedAt, '2026-03-24T15:00:00.000Z');
  assert.equal(next.levels[0].selectedTitle, '标题 1A');
});

test('ensureProgressMatchesDomain resets stale in-memory progress when the active domain changes', () => {
  const scienceProgress = completeLevelInProgress(
    storeArticleForLevel(createDefaultLearningProgress('科学'), 1, '标题 1A', createArticle('标题 1A')),
    1,
    '2026-03-24T15:00:00.000Z',
  );

  const artProgress = ensureProgressMatchesDomain(scienceProgress, '艺术');

  assert.equal(artProgress.domain, '艺术');
  assert.equal(artProgress.currentLevel, 1);
  assert.equal(artProgress.levels[0].selectedTitle, null);
});

test('upsertProgressInCollection adds a new domain without replacing existing ones', () => {
  const science = createDefaultLearningProgress('科学');
  const art = createDefaultLearningProgress('艺术');

  const collection = upsertProgressInCollection([science], art);

  assert.equal(collection.length, 2);
  assert.deepEqual(collection.map((item) => item.domain), ['科学', '艺术']);
});

test('upsertProgressInCollection replaces only the matching domain', () => {
  const science = createDefaultLearningProgress('科学');
  const art = createDefaultLearningProgress('艺术');
  const updatedScience = completeLevelInProgress(science, 1, '2026-03-24T15:00:00.000Z');

  const collection = upsertProgressInCollection([science, art], updatedScience);

  assert.equal(collection.length, 2);
  assert.equal(collection.find((item) => item.domain === '科学')?.currentLevel, 2);
  assert.equal(collection.find((item) => item.domain === '艺术')?.currentLevel, 1);
});

test('removeProgressFromCollection removes only the target domain', () => {
  const science = createDefaultLearningProgress('科学');
  const art = createDefaultLearningProgress('艺术');

  const collection = removeProgressFromCollection([science, art], '艺术');

  assert.deepEqual(collection.map((item) => item.domain), ['科学']);
});

test('resolveActiveDomainAfterDelete chooses the next available domain when deleting the active one', () => {
  const science = createDefaultLearningProgress('科学');
  const art = createDefaultLearningProgress('艺术');

  const nextActiveDomain = resolveActiveDomainAfterDelete([science, art], '科学', '科学');

  assert.equal(nextActiveDomain, '艺术');
});
