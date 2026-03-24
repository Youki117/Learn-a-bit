import type { ArticleData } from '../types';
import { readClientEnv } from '../lib/env';
import type { ApiResponse } from '../types/api';

export type TitleGroupsResponse = {
  titleGroups: string[][];
};

export type ArticleResponse = {
  articleData: ArticleData;
};

const clientEnv = readClientEnv();

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}

export async function generateTitles(domain: string): Promise<string[][]> {
  const data = await request<TitleGroupsResponse>('/api/ai/titles', { domain });
  return data.titleGroups;
}

export async function generateArticleData(domain: string, title: string): Promise<ArticleData> {
  const data = await request<ArticleResponse>('/api/ai/article', { domain, title });
  return data.articleData;
}
