import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyArticleCompletionReward,
  applyPredictionReward,
  applyQuizReward,
  createDefaultPlayerMeta,
  deriveTitleHall,
  toggleFavoriteArticle,
  upsertNote,
} from './player-meta';

test('article completion awards 100 coins and milestone bonus at 10 articles', () => {
  let state = createDefaultPlayerMeta();

  for (let index = 0; index < 9; index += 1) {
    state = applyArticleCompletionReward(state, {
      articleId: `science-${index}`,
      title: `标题 ${index}`,
      domain: '科学',
    });
  }

  const next = applyArticleCompletionReward(state, {
    articleId: 'science-9',
    title: '标题 9',
    domain: '科学',
  });

  assert.equal(next.coins, 2000);
  assert.equal(next.completedArticles, 10);
});

test('prediction reward changes coins by the wager amount and tracks wrong items', () => {
  const initial = createDefaultPlayerMeta();
  const lost = applyPredictionReward(initial, {
    eventId: 'science-1-pred1',
    title: '免疫学',
    domain: '科学',
    correct: false,
    wager: 300,
    prompt: '抗体会如何变化？',
  });
  const won = applyPredictionReward(lost, {
    eventId: 'science-1-pred2',
    title: '免疫学',
    domain: '科学',
    correct: true,
    wager: 200,
    prompt: '记忆细胞会怎样？',
  });

  assert.equal(won.coins, -100);
  assert.equal(won.wrongItems.length, 1);
  assert.equal(won.wrongItems[0].source, 'prediction');
});

test('perfect quiz awards 500 coins exactly once', () => {
  const initial = createDefaultPlayerMeta();
  const rewarded = applyQuizReward(initial, {
    eventId: 'science-1-quiz',
    domain: '科学',
    title: '免疫学',
    totalQuestions: 3,
    correctAnswers: 3,
    wrongPrompts: [],
  });
  const duplicated = applyQuizReward(rewarded, {
    eventId: 'science-1-quiz',
    domain: '科学',
    title: '免疫学',
    totalQuestions: 3,
    correctAnswers: 3,
    wrongPrompts: [],
  });

  assert.equal(rewarded.coins, 500);
  assert.equal(duplicated.coins, 500);
});

test('title hall unlocks stronger titles as article count grows', () => {
  const novice = deriveTitleHall({ ...createDefaultPlayerMeta(), completedArticles: 1 });
  const advanced = deriveTitleHall({ ...createDefaultPlayerMeta(), completedArticles: 12, perfectQuizRuns: 5 });

  assert.equal(novice.currentTitle, '初学者');
  assert.ok(advanced.unlockedTitles.includes('洞见学徒'));
});

test('notes and favorites behave like local shells', () => {
  const base = createDefaultPlayerMeta();
  const noted = upsertNote(base, {
    articleId: 'science-1',
    title: '免疫学',
    domain: '科学',
    content: '第一条笔记',
  });
  const favorited = toggleFavoriteArticle(noted, {
    articleId: 'science-1',
    title: '免疫学',
    domain: '科学',
  });

  assert.equal(favorited.notes.length, 1);
  assert.equal(favorited.favorites.length, 1);
});
