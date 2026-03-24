type ClientEnvSource = Record<string, string | undefined>;

export type ClientEnv = {
  apiBaseUrl: string;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
};

export function readClientEnv(source: ClientEnvSource = import.meta.env): ClientEnv {
  const apiBaseUrl = source.VITE_API_BASE_URL ?? 'http://localhost:3030';

  return {
    apiBaseUrl,
    supabaseUrl: source.VITE_SUPABASE_URL ?? null,
    supabaseAnonKey: source.VITE_SUPABASE_ANON_KEY ?? null,
  };
}
