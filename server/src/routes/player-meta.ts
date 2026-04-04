import type { Express, Response } from 'express';
import type { DbClients } from '../lib/db';
import { createAuthMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { failure, success } from '../lib/response';
import { normalizePlayerMeta, toPlayerMetaRow } from '../lib/player-meta';

export function registerPlayerMetaRoutes(app: Express, clients: DbClients) {
  const requireAuth = createAuthMiddleware(clients);

  app.get('/api/player-meta', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const { data, error } = await clients.supabaseAdmin
      .from('player_meta')
      .select('coins,completed_articles,perfect_quiz_runs,prediction_wins,prediction_losses,notes,favorites,wrong_items,processed_events')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      res.status(500).json(failure('Failed to load player meta'));
      return;
    }

    res.status(200).json(success(normalizePlayerMeta(data)));
  });

  app.put('/api/player-meta', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const body = normalizePlayerMeta(req.body as Record<string, unknown>);

    const { data, error } = await clients.supabaseAdmin
      .from('player_meta')
      .upsert(toPlayerMetaRow(userId, body))
      .select('coins,completed_articles,perfect_quiz_runs,prediction_wins,prediction_losses,notes,favorites,wrong_items,processed_events')
      .single();

    if (error || !data) {
      res.status(500).json(failure('Failed to save player meta'));
      return;
    }

    res.status(200).json(success(normalizePlayerMeta(data)));
  });
}
