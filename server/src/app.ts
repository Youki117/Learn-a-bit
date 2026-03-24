import express, { type NextFunction, type Request, type Response } from 'express';
import { failure, success } from './lib/response';
import type { DbClients } from './lib/db';
import { registerMeRoutes } from './routes/me';
import { registerAiRoutes } from './routes/ai';
import type { AiService } from './lib/genai';
import { registerProgressRoutes } from './routes/progress';

export type AppClients = Partial<DbClients> & { ai?: AiService };

const defaultAllowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function getAllowedOrigins() {
  const configuredOrigin = process.env.APP_URL?.trim();
  return new Set([configuredOrigin, ...defaultAllowedOrigins].filter((origin): origin is string => Boolean(origin)));
}

export function createApp(clients?: AppClients) {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && (allowedOrigins.has(origin) || localOriginPattern.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');
      res.append('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json(success({ status: 'ok' }));
  });

  if (clients?.supabaseAdmin && clients.supabaseAuth) {
    registerMeRoutes(app, {
      supabaseAdmin: clients.supabaseAdmin,
      supabaseAuth: clients.supabaseAuth,
    });
    registerProgressRoutes(app, {
      supabaseAdmin: clients.supabaseAdmin,
      supabaseAuth: clients.supabaseAuth,
    });
  }

  registerAiRoutes(app, clients?.ai);
  app.use((_req, res) => {
    res.status(404).json(failure('Not found'));
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json(failure('Internal server error'));
  });

  return app;
}
