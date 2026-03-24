import type { Express, Response } from 'express';
import type { DbClients } from '../lib/db';
import { failure, success } from '../lib/response';
import { createAuthMiddleware, type AuthenticatedRequest } from '../middleware/auth';
import { createDefaultLearningProgress, normalizeLearningProgress, toLearningProgressRow } from '../lib/learning-progress';
import { requireNonEmptyString } from '../lib/validators';

export function registerProgressRoutes(app: Express, clients: DbClients) {
  const requireAuth = createAuthMiddleware(clients);

  app.get('/api/progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const { data, error } = await clients.supabaseAdmin
        .from('learning_progress')
        .select('domain,current_level,total_levels,levels')
        .eq('user_id', userId)
        .order('domain', { ascending: true });

      if (error) {
        res.status(500).json(failure('Failed to list learning progress'));
        return;
      }

      res.status(200).json(success((data ?? []).map((row) => normalizeLearningProgress(String((row as { domain?: string }).domain ?? ''), row))));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list learning progress';
      res.status(400).json(failure(message));
    }
  });

  app.get('/api/progress/:domain', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const domain = requireNonEmptyString(req.params.domain, 'domain');

      const { data, error } = await clients.supabaseAdmin
        .from('learning_progress')
        .select('current_level,total_levels,levels')
        .eq('user_id', userId)
        .eq('domain', domain)
        .maybeSingle();

      if (error) {
        res.status(500).json(failure('Failed to load learning progress'));
        return;
      }

      res.status(200).json(success(normalizeLearningProgress(domain, data)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load learning progress';
      res.status(400).json(failure(message));
    }
  });

  app.put('/api/progress/:domain', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const domain = requireNonEmptyString(req.params.domain, 'domain');
      const body = req.body as {
        currentLevel?: unknown;
        totalLevels?: unknown;
        levels?: unknown;
      };

      const nextProgress = normalizeLearningProgress(domain, {
        current_level: body.currentLevel,
        total_levels: body.totalLevels,
        levels: body.levels,
      });

      const { data, error } = await clients.supabaseAdmin
        .from('learning_progress')
        .upsert(toLearningProgressRow(userId, nextProgress))
        .select('current_level,total_levels,levels')
        .single();

      if (error || !data) {
        res.status(500).json(failure('Failed to save learning progress'));
        return;
      }

      res.status(200).json(success(normalizeLearningProgress(domain, data)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save learning progress';
      res.status(400).json(failure(message));
    }
  });

  app.delete('/api/progress/:domain', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const domain = requireNonEmptyString(req.params.domain, 'domain');

      const { error } = await clients.supabaseAdmin
        .from('learning_progress')
        .delete()
        .eq('user_id', userId)
        .eq('domain', domain)
        .select('domain')
        .maybeSingle();

      if (error) {
        res.status(500).json(failure('Failed to delete learning progress'));
        return;
      }

      res.status(200).json(success({ domain }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete learning progress';
      res.status(400).json(failure(message));
    }
  });
}
