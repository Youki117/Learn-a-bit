import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.ts';

async function request(path: string) {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('server did not start');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
  const body = await response.json();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { response, body };
}

test('GET /api/health returns ok', async () => {
  const { response, body } = await request('/api/health');

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    success: true,
    data: { status: 'ok' },
    error: null,
  });
});
