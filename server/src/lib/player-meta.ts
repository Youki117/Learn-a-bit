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

type PlayerMetaRow = {
  coins?: unknown;
  completed_articles?: unknown;
  completedArticles?: unknown;
  perfect_quiz_runs?: unknown;
  perfectQuizRuns?: unknown;
  prediction_wins?: unknown;
  predictionWins?: unknown;
  prediction_losses?: unknown;
  predictionLosses?: unknown;
  notes?: unknown;
  favorites?: unknown;
  wrong_items?: unknown;
  wrongItems?: unknown;
  processed_events?: unknown;
  processedEvents?: unknown;
};

function toSafeInt(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeNotes(value: unknown): NoteEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      articleId: typeof item.articleId === 'string' ? item.articleId : '',
      title: typeof item.title === 'string' ? item.title : '',
      domain: typeof item.domain === 'string' ? item.domain : '',
      content: typeof item.content === 'string' ? item.content : '',
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    }))
    .filter((item) => item.articleId);
}

function normalizeFavorites(value: unknown): FavoriteArticle[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      articleId: typeof item.articleId === 'string' ? item.articleId : '',
      title: typeof item.title === 'string' ? item.title : '',
      domain: typeof item.domain === 'string' ? item.domain : '',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    }))
    .filter((item) => item.articleId);
}

function normalizeWrongItems(value: unknown): WrongItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      eventId: typeof item.eventId === 'string' ? item.eventId : '',
      title: typeof item.title === 'string' ? item.title : '',
      domain: typeof item.domain === 'string' ? item.domain : '',
      prompt: typeof item.prompt === 'string' ? item.prompt : '',
      source: (item.source === 'quiz' ? 'quiz' : 'prediction') as 'quiz' | 'prediction',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    }))
    .filter((item) => item.eventId);
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

export function normalizePlayerMeta(row?: PlayerMetaRow | null): PlayerMeta {
  if (!row) {
    return createDefaultPlayerMeta();
  }

  return {
    coins: toSafeInt(row.coins),
    completedArticles: toSafeInt(row.completed_articles ?? row.completedArticles),
    perfectQuizRuns: toSafeInt(row.perfect_quiz_runs ?? row.perfectQuizRuns),
    predictionWins: toSafeInt(row.prediction_wins ?? row.predictionWins),
    predictionLosses: toSafeInt(row.prediction_losses ?? row.predictionLosses),
    notes: normalizeNotes(row.notes),
    favorites: normalizeFavorites(row.favorites),
    wrongItems: normalizeWrongItems(row.wrong_items ?? row.wrongItems),
    processedEvents: toStringArray(row.processed_events ?? row.processedEvents),
  };
}

export function toPlayerMetaRow(userId: string, meta: PlayerMeta) {
  return {
    user_id: userId,
    coins: toSafeInt(meta.coins),
    completed_articles: toSafeInt(meta.completedArticles),
    perfect_quiz_runs: toSafeInt(meta.perfectQuizRuns),
    prediction_wins: toSafeInt(meta.predictionWins),
    prediction_losses: toSafeInt(meta.predictionLosses),
    notes: normalizeNotes(meta.notes),
    favorites: normalizeFavorites(meta.favorites),
    wrong_items: normalizeWrongItems(meta.wrongItems),
    processed_events: toStringArray(meta.processedEvents),
  };
}
