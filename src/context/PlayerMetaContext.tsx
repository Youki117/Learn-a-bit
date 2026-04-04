import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyArticleCompletionReward,
  applyPredictionReward,
  applyQuizReward,
  createDefaultPlayerMeta,
  deriveTitleHall,
  toggleFavoriteArticle,
  upsertNote,
  type PlayerMeta,
} from '../lib/player-meta';
import { fetchPlayerMeta, savePlayerMeta } from '../services/api';
import { useAuth } from './AuthContext';

const STORAGE_KEY_PREFIX = 'learn-a-bit.player-meta.v1';

export type PlayerMetaContextValue = {
  meta: PlayerMeta;
  titleHall: ReturnType<typeof deriveTitleHall>;
  rewardArticleCompletion: (input: { articleId: string; title: string; domain: string }) => void;
  rewardPrediction: (input: {
    eventId: string;
    title: string;
    domain: string;
    prompt: string;
    correct: boolean;
    wager: number;
  }) => void;
  rewardQuiz: (input: {
    eventId: string;
    title: string;
    domain: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongPrompts: string[];
  }) => void;
  toggleFavorite: (input: { articleId: string; title: string; domain: string }) => void;
  saveNote: (input: { articleId: string; title: string; domain: string; content: string }) => void;
  isFavorite: (articleId: string) => boolean;
};

const PlayerMetaContext = createContext<PlayerMetaContextValue | null>(null);

function getStorageKey(userId: string | null) {
  return `${STORAGE_KEY_PREFIX}:${userId ?? 'guest'}`;
}

function readStoredMeta(userId: string | null) {
  if (typeof window === 'undefined') {
    return createDefaultPlayerMeta();
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    return raw ? ({ ...createDefaultPlayerMeta(), ...JSON.parse(raw) } as PlayerMeta) : createDefaultPlayerMeta();
  } catch {
    return createDefaultPlayerMeta();
  }
}

export function PlayerMetaProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [meta, setMeta] = useState<PlayerMeta>(() => readStoredMeta(userId));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMeta(readStoredMeta(userId));
    setHydrated(false);
  }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getStorageKey(userId), JSON.stringify(meta));
    }
  }, [meta, userId]);

  useEffect(() => {
    const token = session?.access_token;

    if (!token) {
      setHydrated(true);
      return;
    }

    let cancelled = false;

    void fetchPlayerMeta(token)
      .then((serverMeta) => {
        if (!cancelled) {
          setMeta(serverMeta);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    const token = session?.access_token;

    if (!token || !hydrated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void savePlayerMeta(token, meta).catch(() => {
        // Local cache remains the fallback when sync fails.
      });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hydrated, meta, session?.access_token]);

  const value = useMemo<PlayerMetaContextValue>(
    () => ({
      meta,
      titleHall: deriveTitleHall(meta),
      rewardArticleCompletion: (input) => setMeta((current) => applyArticleCompletionReward(current, input)),
      rewardPrediction: (input) => setMeta((current) => applyPredictionReward(current, input)),
      rewardQuiz: (input) => setMeta((current) => applyQuizReward(current, input)),
      toggleFavorite: (input) => setMeta((current) => toggleFavoriteArticle(current, input)),
      saveNote: (input) => setMeta((current) => upsertNote(current, input)),
      isFavorite: (articleId) => meta.favorites.some((item) => item.articleId === articleId),
    }),
    [meta],
  );

  return <PlayerMetaContext.Provider value={value}>{children}</PlayerMetaContext.Provider>;
}

export function usePlayerMeta() {
  const context = useContext(PlayerMetaContext);
  if (!context) {
    throw new Error('usePlayerMeta must be used within PlayerMetaProvider');
  }

  return context;
}
