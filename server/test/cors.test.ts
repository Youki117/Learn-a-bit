import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';

async function request(method: string, path: string, headers?: Record<string, string>) {
  const app = createApp();
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
    headers,
  });

  const text = await response.text();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { response, text };
}

test('OPTIONS /api/ai/titles returns CORS headers for local frontend', async () => {
  const origin = 'http://127.0.0.1:3000';
  const { response } = await request('OPTIONS', '/api/ai/titles', {
    origin,
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type',
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-methods'), 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  assert.equal(response.headers.get('access-control-allow-headers'), 'content-type,authorization');
  assert.match(response.headers.get('vary') ?? '', /Origin/);
});

test('OPTIONS /api/ai/titles returns CORS headers for alternate local frontend port', async () => {
  const origin = 'http://localhost:3031';
  const { response } = await request('OPTIONS', '/api/ai/titles', {
    origin,
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type',
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-methods'), 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  assert.equal(response.headers.get('access-control-allow-headers'), 'content-type,authorization');
  assert.match(response.headers.get('vary') ?? '', /Origin/);
});

test('OPTIONS /api/progress/:domain allows authenticated PUT requests from the frontend', async () => {
  const origin = 'http://localhost:3031';
  const { response } = await request('OPTIONS', '/api/progress/%E7%A7%91%E5%AD%A6', {
    origin,
    'access-control-request-method': 'PUT',
    'access-control-request-headers': 'content-type,authorization',
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-methods'), 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  assert.equal(response.headers.get('access-control-allow-headers'), 'content-type,authorization');
});
