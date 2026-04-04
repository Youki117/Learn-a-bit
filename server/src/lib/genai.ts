import { OpenAI } from 'openai';
import { loadEnv } from '../config/env';
import { requireNonEmptyString } from './validators';

export type TitleGroupsResult = {
  titleGroups: string[][];
};

export type ArticleDataResult = {
  part1: string;
  part2: string;
  part3: string;
  chunkPlan: string[];
  prediction1: { question: string; options: string[]; correctIndex: number };
  prediction2: { question: string; options: string[]; correctIndex: number };
  quiz: { question: string; options: string[]; correctIndex: number }[];
};

export type AiService = {
  generateTitles(domain: string): Promise<TitleGroupsResult>;
  generateArticle(title: string, domain: string): Promise<ArticleDataResult>;
};

function createClient() {
  const env = loadEnv();
  return new OpenAI({
    baseURL: 'https://gemini-web-api-c35l.onrender.com/v1',
    apiKey: env.geminiApiKey,
  });
}

function stripCodeFences(text: string) {
  return text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/m, '').trim();
}

function extractJsonPayload(text: string) {
  const cleaned = stripCodeFences(text);
  const start = cleaned.search(/[\[{]/);

  if (start === -1) {
    return cleaned;
  }

  const opening = cleaned[start];
  const closing = opening === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === opening) {
      depth += 1;
      continue;
    }

    if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return cleaned.slice(start, index + 1);
      }
    }
  }

  return cleaned.slice(start);
}

function stripTrailingCommas(text: string) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === ',') {
      const rest = text.slice(index + 1);
      const match = rest.match(/^\s*([\]}])/);
      if (match) {
        continue;
      }
    }

    result += char;
  }

  return result;
}

export function parseModelJson<T>(text: string): T {
  const payload = extractJsonPayload(text);
  
  // Guard against non-JSON text starting with characters like '无' (Cannot...)
  const trimmed = payload.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error(`AI 服务返回了异常说明（非 JSON）: "${trimmed.slice(0, 50)}..."`);
  }

  const cleaned = stripTrailingCommas(payload);
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse AI response as JSON. Content:', text);
    throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

function normalizeTitleGroups(value: unknown): string[][] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid titleGroups format');
  }

  if (value.length === 30 && value.every((item) => typeof item === 'string')) {
    const titles = value.map((item) => requireNonEmptyString(item, 'title'));
    return Array.from({ length: 10 }, (_, index) => titles.slice(index * 3, index * 3 + 3));
  }

  if (value.length === 10 && value.every((item) => Array.isArray(item))) {
    return value.map((group, groupIndex) => {
      if (group.length !== 3) {
        throw new Error('Each title group must contain 3 titles');
      }

      return group.map((item, itemIndex) => requireNonEmptyString(item, `titleGroups[${groupIndex}][${itemIndex}]`));
    });
  }

  throw new Error('titleGroups must contain 10 groups of 3 titles');
}

export function createAiService(): AiService {
  return {
    generateTitles,
    generateArticle,
  };
}

export async function generateTitles(domain: string): Promise<TitleGroupsResult> {
  const safeDomain = requireNonEmptyString(domain, 'domain');
  const client = createClient();

  const response = await client.chat.completions.create({
    model: 'gemini-3.1-flash-lite',
    messages: [
      {
        role: 'user',
        content: `请只返回 JSON。根据领域「${safeDomain}」生成 30 个吸引个人点击的标题，分成 10 组，每组 3 个。标题要偏好奇心、成长、现实关联，不要学术化。输出格式：{ "titleGroups": [["...", "...", "..."], ...] }`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty model response');
  }

  const parsed = parseModelJson<{ titleGroups: unknown }>(content);
  return { titleGroups: normalizeTitleGroups(parsed.titleGroups) };
}

export async function generateArticle(title: string, domain: string): Promise<ArticleDataResult> {
  const safeTitle = requireNonEmptyString(title, 'title');
  const safeDomain = requireNonEmptyString(domain, 'domain');
  const client = createClient();

  const response = await client.chat.completions.create({
    model: 'gemini-3.1-flash-lite',
    messages: [
      {
        role: 'user',
        content: `请只返回 JSON。根据领域「${safeDomain}」和标题「${safeTitle}」一次性生成文章包，包含 part1, part2, part3, chunkPlan, prediction1, prediction2, quiz。题目全部为 4 选 1，correctIndex 必须是 0-3。输出格式：{ "part1": "...", "part2": "...", "part3": "...", "chunkPlan": ["..."], "prediction1": { "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0 }, "prediction2": { "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0 }, "quiz": [{ "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0 }] }`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty model response');
  }

  return parseModelJson<ArticleDataResult>(content);
}
