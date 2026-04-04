import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';

type StoredPlayerMetaRow = {
  user_id: string;
  coins: number;
  completed_articles: number;
  perfect_quiz_runs: number;
  prediction_wins: number;
  prediction_losses: number;
  notes: unknown[];
  favorites: unknown[];
  wrong_items: unknown[];
  processed_events: unknown[];
};

function createPlayerMetaStore() {
  const rows = new Map<string, StoredPlayerMetaRow>();

  return {
    read(userId: string) {
      return rows.get(userId) ?? null;
    },
    write(row: StoredPlayerMetaRow) {
      rows.set(row.user_id, row);
      return row;
    },
  };
}

function createClients() {
  const store = createPlayerMetaStore();

  const supabaseAdmin = {
    from(table: string) {
      if (table === 'player_meta') {
        return {
          select() {
            const filters: Record<string, string> = {};

            return {
              eq(column: string, value: string) {
                filters[column] = value;
                return this;
              },
              maybeSingle: async () => ({
                data: store.read(filters.user_id),
                error: null,
              }),
            };
          },
          upsert(row: StoredPlayerMetaRow) {
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
        };
      }

      if (table === 'profiles' || table === 'learning_progress') {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: null, error: null }),
                  single: async () => ({ data: null, error: null }),
                };
              },
              order() {
                return Promise.resolve({ data: [], error: null });
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
          delete() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      select() {
                        return {
                          maybeSingle: async () => ({ data: null, error: null }),
                        };
                      },
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

  return { clients: { supabaseAdmin, supabaseAuth, ai } };
}

async function request(method: string, path: string, body?: unknown, clientsOverride?: ReturnType<typeof createClients>['clients']) {
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

test('GET /api/player-meta returns defaults when no row exists', async () => {
  const { clients } = createClients();
  const { response, payload } = await request('GET', '/api/player-meta', undefined, clients);

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.coins, 0);
  assert.equal(payload.data.completedArticles, 0);
  assert.deepEqual(payload.data.notes, []);
  assert.deepEqual(payload.data.favorites, []);
});

test('PUT /api/player-meta persists coins, notes, favorites, wrong items and processed events', async () => {
  const { clients } = createClients();
  const body = {
    coins: 1800,
    completedArticles: 12,
    perfectQuizRuns: 2,
    predictionWins: 3,
    predictionLosses: 1,
    notes: [{ articleId: 'science:1', title: '免疫学', domain: '科学', content: '记住抗体', updatedAt: '2026-03-25T01:00:00.000Z' }],
    favorites: [{ articleId: 'science:1', title: '免疫学', domain: '科学', createdAt: '2026-03-25T01:00:00.000Z' }],
    wrongItems: [{ eventId: 'science:1:quiz:wrong:0', title: '免疫学', domain: '科学', prompt: '抗体如何形成？', source: 'quiz', createdAt: '2026-03-25T01:00:00.000Z' }],
    processedEvents: ['article:science:1'],
  };

  const saved = await request('PUT', '/api/player-meta', body, clients);
  assert.equal(saved.response.status, 200);
  assert.equal(saved.payload.data.coins, 1800);

  const loaded = await request('GET', '/api/player-meta', undefined, clients);
  assert.equal(loaded.response.status, 200);
  assert.equal(loaded.payload.data.completedArticles, 12);
  assert.equal(loaded.payload.data.notes.length, 1);
  assert.equal(loaded.payload.data.favorites.length, 1);
  assert.equal(loaded.payload.data.wrongItems.length, 1);
  assert.equal(loaded.payload.data.processedEvents.length, 1);
});
