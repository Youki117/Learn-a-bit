import { readClientEnv } from '../lib/env';
import type { LearningProgress } from '../types/learning-progress';
import type { ApiResponse } from '../types/api';
import type { PlayerMeta } from '../lib/player-meta';

const clientEnv = readClientEnv();

async function request<T>(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data as T;
}

export async function fetchCurrentUser<T>(token: string) {
  return request<T>('/api/me', { token });
}

export async function patchCurrentUser<T>(token: string, body: Record<string, unknown>) {
  return request<T>('/api/me', { method: 'PATCH', token, body });
}

export async function fetchLearningProgress(token: string, domain: string) {
  return request<LearningProgress>(`/api/progress/${encodeURIComponent(domain)}`, { token });
}

export async function fetchAllLearningProgress(token: string) {
  return request<LearningProgress[]>('/api/progress', { token });
}

export async function saveLearningProgress(token: string, progress: LearningProgress) {
  return request<LearningProgress>(`/api/progress/${encodeURIComponent(progress.domain)}`, {
    method: 'PUT',
    token,
    body: {
      currentLevel: progress.currentLevel,
      totalLevels: progress.totalLevels,
      levels: progress.levels,
    },
  });
}

export async function deleteLearningProgress(token: string, domain: string) {
  return request<{ domain: string }>(`/api/progress/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchPlayerMeta(token: string) {
  return request<PlayerMeta>('/api/player-meta', { token });
}

export async function savePlayerMeta(token: string, meta: PlayerMeta) {
  return request<PlayerMeta>('/api/player-meta', {
    method: 'PUT',
    token,
    body: meta,
  });
}
