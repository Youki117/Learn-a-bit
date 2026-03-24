import { config } from 'dotenv';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { createDbClients } from './lib/db';
import { createAiService } from './lib/genai';

config();

const env = loadEnv();
const dbClients = env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey ? createDbClients(env) : undefined;
const app = createApp({
  ...dbClients,
  ai: createAiService(),
});

app.listen(env.port, () => {
  console.log(`Server listening on ${env.port}`);
});
