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

  if (response.status === 502 || response.status === 504) {
    throw new Error('AI 生成超时或服务器繁忙，请稍后刷新重试 (502)');
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`服务器响应异常: ${response.status} ${text.slice(0, 50)}`);
  }

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
