import test from 'node:test';
import assert from 'node:assert/strict';

const originalEnv = { ...process.env };

test('loadEnv throws when required vars are missing', async () => {
  const module = await import('../src/config/env.ts?missing=' + Date.now());
  assert.equal(typeof module.loadEnv, 'function');

  process.env = {} as NodeJS.ProcessEnv;
  assert.throws(() => module.loadEnv(), /Missing required environment variables/);
});

test('loadEnv returns typed config when vars exist', async () => {
  process.env = {
    ...originalEnv,
    PORT: '4001',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    GEMINI_API_KEY: 'gemini-key',
  } as NodeJS.ProcessEnv;

  const module = await import('../src/config/env.ts?valid=' + Date.now());
  const env = module.loadEnv();

  assert.equal(env.port, 4001);
  assert.equal(env.supabaseUrl, 'https://example.supabase.co');
  assert.equal(env.supabaseAnonKey, 'anon-key');
  assert.equal(env.supabaseServiceRoleKey, 'service-role-key');
  assert.equal(env.geminiApiKey, 'gemini-key');
});

test('loadEnv allows local AI-only startup without supabase vars', async () => {
  process.env = {
    ...originalEnv,
    GEMINI_API_KEY: 'gemini-key',
  } as NodeJS.ProcessEnv;

  const module = await import('../src/config/env.ts?local=' + Date.now());
  const env = module.loadEnv();

  assert.equal(env.geminiApiKey, 'gemini-key');
  assert.equal(env.supabaseUrl, null);
  assert.equal(env.supabaseAnonKey, null);
  assert.equal(env.supabaseServiceRoleKey, null);
});
