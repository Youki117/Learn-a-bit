export type FavoriteArticle = {
  articleId: string;
  title: string;
  domain: string;
  createdAt: string;
};

export type NoteEntry = {
  articleId: string;
  title: string;
  domain: string;
  content: string;
  updatedAt: string;
};

export type WrongItem = {
  eventId: string;
  title: string;
  domain: string;
  prompt: string;
  source: 'prediction' | 'quiz';
  createdAt: string;
};

export type PlayerMeta = {
  coins: number;
  completedArticles: number;
  perfectQuizRuns: number;
  predictionWins: number;
  predictionLosses: number;
  notes: NoteEntry[];
  favorites: FavoriteArticle[];
  wrongItems: WrongItem[];
  processedEvents: string[];
};

type ArticleCompletionInput = {
  articleId: string;
  title: string;
  domain: string;
};

type PredictionRewardInput = {
  eventId: string;
  title: string;
  domain: string;
  prompt: string;
  correct: boolean;
  wager: number;
};

type QuizRewardInput = {
  eventId: string;
  title: string;
  domain: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongPrompts: string[];
};

const TITLE_RULES = [
  { threshold: 1, title: '初学者' },
  { threshold: 10, title: '洞见学徒' },
  { threshold: 50, title: '星图策士' },
  { threshold: 100, title: '博识殿堂' },
] as const;

function hasEvent(state: PlayerMeta, eventId: string) {
  return state.processedEvents.includes(eventId);
}

function appendEvent(state: PlayerMeta, eventId: string): PlayerMeta {
  if (hasEvent(state, eventId)) {
    return state;
  }

  return {
    ...state,
    processedEvents: [...state.processedEvents, eventId],
  };
}

export function createDefaultPlayerMeta(): PlayerMeta {
  return {
    coins: 0,
    completedArticles: 0,
    perfectQuizRuns: 0,
    predictionWins: 0,
    predictionLosses: 0,
    notes: [],
    favorites: [],
    wrongItems: [],
    processedEvents: [],
  };
}

export function applyArticleCompletionReward(state: PlayerMeta, input: ArticleCompletionInput): PlayerMeta {
  const eventId = `article:${input.articleId}`;
  if (hasEvent(state, eventId)) {
    return state;
  }

  const completedArticles = state.completedArticles + 1;
  let coins = state.coins + 100;

  if (completedArticles === 10) {
    coins += 1000;
  }

  if (completedArticles === 100) {
    coins += 10000;
  }

  return appendEvent(
    {
      ...state,
      coins,
      completedArticles,
    },
    eventId,
  );
}

export function applyPredictionReward(state: PlayerMeta, input: PredictionRewardInput): PlayerMeta {
  if (hasEvent(state, input.eventId)) {
    return state;
  }

  const baseState: PlayerMeta = {
    ...state,
    coins: state.coins + (input.correct ? input.wager : -input.wager),
    predictionWins: state.predictionWins + (input.correct ? 1 : 0),
    predictionLosses: state.predictionLosses + (input.correct ? 0 : 1),
    wrongItems: input.correct
      ? state.wrongItems
      : [
          {
            eventId: input.eventId,
            title: input.title,
            domain: input.domain,
            prompt: input.prompt,
            source: 'prediction',
            createdAt: new Date().toISOString(),
          },
          ...state.wrongItems.filter((item) => item.eventId !== input.eventId),
        ],
  };

  return appendEvent(baseState, input.eventId);
}

export function applyQuizReward(state: PlayerMeta, input: QuizRewardInput): PlayerMeta {
  if (hasEvent(state, input.eventId)) {
    return state;
  }

  const perfect = input.totalQuestions > 0 && input.correctAnswers === input.totalQuestions;
  const wrongItems = [
    ...input.wrongPrompts.map<WrongItem>((prompt, index) => ({
      eventId: `${input.eventId}:wrong:${index}`,
      title: input.title,
      domain: input.domain,
      prompt,
      source: 'quiz',
      createdAt: new Date().toISOString(),
    })),
    ...state.wrongItems,
  ];

  const nextState: PlayerMeta = {
    ...state,
    coins: state.coins + (perfect ? 500 : 0),
    perfectQuizRuns: state.perfectQuizRuns + (perfect ? 1 : 0),
    wrongItems,
  };

  return appendEvent(nextState, input.eventId);
}

export function toggleFavoriteArticle(
  state: PlayerMeta,
  input: { articleId: string; title: string; domain: string },
): PlayerMeta {
  const exists = state.favorites.some((item) => item.articleId === input.articleId);

  return {
    ...state,
    favorites: exists
      ? state.favorites.filter((item) => item.articleId !== input.articleId)
      : [
          {
            articleId: input.articleId,
            title: input.title,
            domain: input.domain,
            createdAt: new Date().toISOString(),
          },
          ...state.favorites,
        ],
  };
}

export function upsertNote(
  state: PlayerMeta,
  input: { articleId: string; title: string; domain: string; content: string },
): PlayerMeta {
  const note: NoteEntry = {
    articleId: input.articleId,
    title: input.title,
    domain: input.domain,
    content: input.content,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = state.notes.findIndex((item) => item.articleId === input.articleId);

  if (existingIndex === -1) {
    return {
      ...state,
      notes: [note, ...state.notes],
    };
  }

  return {
    ...state,
    notes: state.notes.map((item) => (item.articleId === input.articleId ? note : item)),
  };
}

export function deriveTitleHall(state: PlayerMeta) {
  const unlockedTitles = TITLE_RULES.filter((rule) => state.completedArticles >= rule.threshold).map((rule) => rule.title);

  return {
    currentTitle: unlockedTitles[unlockedTitles.length - 1] ?? '初学者',
    unlockedTitles,
    nextTitle:
      TITLE_RULES.find((rule) => state.completedArticles < rule.threshold) ?? null,
  };
}
