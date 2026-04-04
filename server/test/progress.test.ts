import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';

type StoredProgressRow = {
  user_id: string;
  domain: string;
  current_level: number;
  total_levels: number;
  levels: unknown[];
};

function createProgressStore() {
  const rows = new Map<string, StoredProgressRow>();

  return {
    read(userId: string, domain: string) {
      return rows.get(`${userId}::${domain}`) ?? null;
    },
    list(userId: string) {
      return [...rows.values()]
        .filter((row) => row.user_id === userId)
        .sort((left, right) => left.domain.localeCompare(right.domain, 'zh-CN'));
    },
    write(row: StoredProgressRow) {
      rows.set(`${row.user_id}::${row.domain}`, row);
      return row;
    },
    remove(userId: string, domain: string) {
      const key = `${userId}::${domain}`;
      const existing = rows.get(key) ?? null;
      if (existing) {
        rows.delete(key);
      }
      return existing;
    },
  };
}

function createClients() {
  const store = createProgressStore();

  const supabaseAdmin = {
    from(table: string) {
      if (table === 'learning_progress') {
        return {
          select() {
            const filters: Record<string, string> = {};

            return {
              eq(column: string, value: string) {
                filters[column] = value;
                return this;
              },
              order() {
                return this;
              },
              maybeSingle: async () => ({
                data: store.read(filters.user_id, filters.domain),
                error: null,
              }),
              then(resolve: (value: { data: StoredProgressRow[]; error: null }) => unknown) {
                return Promise.resolve(resolve({ data: store.list(filters.user_id), error: null }));
              },
            };
          },
          upsert(row: StoredProgressRow) {
            return {
              select() {
                return {
                  single: async () => ({
                    data: store.write(row),
                    error: null,
                  }),
                };
              },
            };
          },
          delete() {
            const filters: Record<string, string> = {};

            return {
              eq(column: string, value: string) {
                filters[column] = value;
                return this;
              },
              select() {
                return {
                  maybeSingle: async () => ({
                    data: store.remove(filters.user_id, filters.domain),
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }

      if (table === 'profiles') {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: null, error: null }),
                  single: async () => ({ data: null, error: null }),
                };
              },
            };
          },
          insert() {
            return {
              select() {
                return {
                  single: async () => ({ data: null, error: null }),
                };
              },
            };
          },
          update() {
            return {
              eq() {
                return {
                  select() {
                    return {
                      single: async () => ({ data: null, error: null }),
                    };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  } as const;

  const supabaseAuth = {
    auth: {
      getUser: async (token: string) => {
        if (token !== 'valid-token') {
          return { data: { user: null }, error: new Error('bad token') };
        }

        return {
          data: {
            user: {
              id: 'user-1',
              email: 'learner@example.com',
            },
          },
          error: null,
        };
      },
    },
  } as const;

  const ai = {
    generateTitles: async () => ({ titleGroups: [] }),
    generateArticle: async () => ({
      part1: '',
      part2: '',
      part3: '',
      chunkPlan: [],
      prediction1: { question: '', options: ['', '', '', ''], correctIndex: 0 },
      prediction2: { question: '', options: ['', '', '', ''], correctIndex: 0 },
      quiz: [],
    }),
  } as const;

  return { store, clients: { supabaseAdmin, supabaseAuth, ai } };
}

function createBlankLevels() {
  return Array.from({ length: 10 }, (_, index) => ({
    level: index + 1,
    titleOptions: [] as string[],
    selectedTitle: null as string | null,
    articleData: null as null,
    completedAt: null as string | null,
  }));
}

function createSavedProgress(domain: string) {
  const levels = createBlankLevels();
  levels[0] = {
    level: 1,
    titleOptions: ['标题 1A', '标题 1B', '标题 1C'],
    selectedTitle: '标题 1A',
    articleData: {
      part1: '第一段',
      part2: '第二段',
      part3: '第三段',
      chunkPlan: ['a', 'b', 'c'],
      prediction1: { question: 'q1', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
      prediction2: { question: 'q2', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
      quiz: [{ question: 'q3', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }],
    },
    completedAt: '2026-03-24T14:00:00.000Z',
  };

  return {
    currentLevel: 2,
    totalLevels: 10,
    levels,
  };
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  clientsOverride?: ReturnType<typeof createClients>['clients'],
) {
  const app = createApp(clientsOverride as never);
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('server did not start');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method,
    headers: {
      authorization: 'Bearer valid-token',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { response, payload };
}

test('GET /api/progress/:domain returns default progress when missing', async () => {
  const { clients } = createClients();
  const { response, payload } = await request('GET', `/api/progress/${encodeURIComponent('科学')}`, undefined, clients);

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.domain, '科学');
  assert.equal(payload.data.currentLevel, 1);
  assert.equal(payload.data.totalLevels, 10);
  assert.equal(payload.data.levels.length, 10);
  assert.equal(payload.data.levels[0].level, 1);
  assert.deepEqual(payload.data.levels[0].titleOptions, []);
  assert.equal(payload.data.levels[0].selectedTitle, null);
  assert.equal(payload.data.levels[0].articleData, null);
  assert.equal(payload.data.levels[0].completedAt, null);
  assert.equal(payload.data.levels[0].session.status, 'idle');
  assert.equal(payload.data.levels[0].session.lessonStep, 1);
});

test('PUT /api/progress/:domain persists selected article and restores it on GET', async () => {
  const { clients } = createClients();
  const progress = createSavedProgress('科学');

  const putResult = await request('PUT', `/api/progress/${encodeURIComponent('科学')}`, progress, clients);
  assert.equal(putResult.response.status, 200);
  assert.equal(putResult.payload.data.currentLevel, 2);

  const getResult = await request('GET', `/api/progress/${encodeURIComponent('科学')}`, undefined, clients);
  assert.equal(getResult.response.status, 200);
  assert.equal(getResult.payload.data.levels[0].selectedTitle, '标题 1A');
  assert.equal(getResult.payload.data.levels[0].articleData.part1, '第一段');
  assert.equal(getResult.payload.data.currentLevel, 2);
  assert.equal(getResult.payload.data.levels[0].session.status, 'idle');
});

test('progress is isolated per domain for the same user', async () => {
  const { clients } = createClients();
  const science = createSavedProgress('科学');
  const art = createSavedProgress('艺术');
  art.currentLevel = 1;
  art.levels[0] = {
    ...art.levels[0],
    selectedTitle: '艺术标题 1A',
    completedAt: null,
  };

  await request('PUT', `/api/progress/${encodeURIComponent('科学')}`, science, clients);
  await request('PUT', `/api/progress/${encodeURIComponent('艺术')}`, art, clients);

  const scienceResult = await request('GET', `/api/progress/${encodeURIComponent('科学')}`, undefined, clients);
  const artResult = await request('GET', `/api/progress/${encodeURIComponent('艺术')}`, undefined, clients);

  assert.equal(scienceResult.payload.data.domain, '科学');
  assert.equal(scienceResult.payload.data.currentLevel, 2);
  assert.equal(scienceResult.payload.data.levels[0].selectedTitle, '标题 1A');

  assert.equal(artResult.payload.data.domain, '艺术');
  assert.equal(artResult.payload.data.currentLevel, 1);
  assert.equal(artResult.payload.data.levels[0].selectedTitle, '艺术标题 1A');
});

test('GET /api/progress returns all persisted domains for the user', async () => {
  const { clients } = createClients();
  const science = createSavedProgress('科学');
  const art = createSavedProgress('艺术');

  await request('PUT', `/api/progress/${encodeURIComponent('科学')}`, science, clients);
  await request('PUT', `/api/progress/${encodeURIComponent('艺术')}`, art, clients);

  const result = await request('GET', '/api/progress', undefined, clients);

  assert.equal(result.response.status, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.data.length, 2);
  assert.deepEqual(result.payload.data.map((item: { domain: string }) => item.domain), ['科学', '艺术']);
});

test('DELETE /api/progress/:domain removes only that domain progress', async () => {
  const { clients } = createClients();
  const science = createSavedProgress('科学');
  const art = createSavedProgress('艺术');

  await request('PUT', `/api/progress/${encodeURIComponent('科学')}`, science, clients);
  await request('PUT', `/api/progress/${encodeURIComponent('艺术')}`, art, clients);

  const deleteResult = await request('DELETE', `/api/progress/${encodeURIComponent('艺术')}`, undefined, clients);
  assert.equal(deleteResult.response.status, 200);
  assert.equal(deleteResult.payload.success, true);

  const listResult = await request('GET', '/api/progress', undefined, clients);
  assert.equal(listResult.payload.data.length, 1);
  assert.equal(listResult.payload.data[0].domain, '科学');

  const deletedDomain = await request('GET', `/api/progress/${encodeURIComponent('艺术')}`, undefined, clients);
  assert.equal(deletedDomain.payload.data.domain, '艺术');
  assert.equal(deletedDomain.payload.data.currentLevel, 1);
});
