import test from 'node:test';
import assert from 'node:assert/strict';
import { readClientEnv } from './env';

test('readClientEnv uses defaults and required vars', () => {
  const env = readClientEnv({
    VITE_API_BASE_URL: 'http://localhost:4000',
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  });

  assert.deepEqual(env, {
    apiBaseUrl: 'http://localhost:4000',
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'anon-key',
  });
});

test('readClientEnv falls back to default api url', () => {
  const env = readClientEnv({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  });

  assert.equal(env.apiBaseUrl, 'http://localhost:3030');
});

test('readClientEnv tolerates missing supabase vars', () => {
  const env = readClientEnv({});

  assert.equal(env.apiBaseUrl, 'http://localhost:3030');
  assert.equal(env.supabaseUrl, null);
  assert.equal(env.supabaseAnonKey, null);
});
