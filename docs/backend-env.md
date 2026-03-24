# Backend Environment Variables

The backend reads these variables at startup:

- `PORT` — server port, defaults to `3030`
- `APP_URL` — allowed frontend origin for local CORS, defaults to `http://localhost:3000`
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `GEMINI_API_KEY` — Gemini API key used by the backend only

## Local development

1. Copy `.env.example` to `.env`.
2. Fill in the Supabase and Gemini credentials.
3. Start the backend:

```bash
cd server
npm install
npm run dev
```

## Notes

- Never expose the service role key in the frontend.
- The frontend should call the backend through `VITE_API_BASE_URL`.
- The backend validates required variables before starting.
