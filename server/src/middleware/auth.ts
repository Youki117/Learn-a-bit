import type { NextFunction, Request, Response } from 'express';
import type { DbClients } from '../lib/db';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string | null;
  };
};

export function createAuthMiddleware(clients: DbClients) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, data: null, error: 'Unauthorized' });
      return;
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json({ success: false, data: null, error: 'Unauthorized' });
      return;
    }

    const { data, error } = await clients.supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ success: false, data: null, error: 'Unauthorized' });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
    };

    next();
  };
}
