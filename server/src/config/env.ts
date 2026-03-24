export type ServerEnv = {
  port: number;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  geminiApiKey: string;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  if (!source.GEMINI_API_KEY) {
    throw new Error('Missing required environment variables: GEMINI_API_KEY');
  }

  return {
    port: Number(source.PORT ?? 3030),
    supabaseUrl: source.SUPABASE_URL ?? null,
    supabaseAnonKey: source.SUPABASE_ANON_KEY ?? null,
    supabaseServiceRoleKey: source.SUPABASE_SERVICE_ROLE_KEY ?? null,
    geminiApiKey: source.GEMINI_API_KEY,
  };
}
