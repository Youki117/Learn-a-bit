import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';
import type { DbClients } from '../src/lib/db.ts';

const clients: DbClients = {
  supabaseAuth: {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as never,
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
};

async function request(method: string, path: string, headers?: Record<string, string>, body?: unknown) {
  const app = createApp(clients);
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
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { response, body: parsed };
}

test('GET /api/me rejects missing auth header', async () => {
  const { response, body } = await request('GET', '/api/me');

  assert.equal(response.status, 401);
  assert.equal(body.error, 'Unauthorized');
});

test('GET /api/me rejects invalid bearer token', async () => {
  const { response, body } = await request('GET', '/api/me', { authorization: 'Bearer bad-token' });

  assert.equal(response.status, 401);
  assert.equal(body.error, 'Unauthorized');
});
