import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';

const clients = {
  supabaseAuth: {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  },
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      }),
    }),
  } as never,
  ai: {
    generateTitles: async () => ({
      titleGroups: [
        ['标题1', '标题2', '标题3'],
        ['标题4', '标题5', '标题6'],
        ['标题7', '标题8', '标题9'],
        ['标题10', '标题11', '标题12'],
        ['标题13', '标题14', '标题15'],
        ['标题16', '标题17', '标题18'],
        ['标题19', '标题20', '标题21'],
        ['标题22', '标题23', '标题24'],
        ['标题25', '标题26', '标题27'],
        ['标题28', '标题29', '标题30'],
      ],
    }),
    generateArticle: async () => ({
      part1: 'p1',
      part2: 'p2',
      part3: 'p3',
      chunkPlan: ['a', 'b', 'c'],
      prediction1: { question: 'q1', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
      prediction2: { question: 'q2', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
      quiz: [{ question: 'q3', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }],
    }),
  },
} as const;

async function request(method: string, path: string, body?: unknown) {
  const app = createApp(clients as never);
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('server did not start');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { response, payload };
}

test('POST /api/ai/titles returns 10 groups of 3', async () => {
  const { response, payload } = await request('POST', '/api/ai/titles', { domain: '科学' });

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.titleGroups.length, 10);
  assert.equal(payload.data.titleGroups[0].length, 3);
});

test('POST /api/ai/article returns article data', async () => {
  const { response, payload } = await request('POST', '/api/ai/article', { domain: '科学', title: '标题1' });

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.articleData.part1, 'p1');
  assert.equal(payload.data.articleData.quiz.length, 1);
});

test('POST /api/ai/titles rejects empty domain', async () => {
  const { response, payload } = await request('POST', '/api/ai/titles', { domain: '' });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
});
