import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ServerEnv } from '../config/env';

export type DbClients = {
  supabaseAdmin: SupabaseClient;
  supabaseAuth: SupabaseClient;
};

export function createDbClients(env: ServerEnv): DbClients {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase credentials are required to create database clients');
  }

  return {
    supabaseAdmin: createClient(env.supabaseUrl, env.supabaseServiceRoleKey),
    supabaseAuth: createClient(env.supabaseUrl, env.supabaseAnonKey),
  };
}
