import type { Express, Request, Response } from 'express';
import type { DbClients } from '../lib/db';
import { createAuthMiddleware, type AuthenticatedRequest } from '../middleware/auth';

function toSafeProfile(profile: {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  theme_preference: string | null;
  notifications_enabled: boolean | null;
}) {
  return {
    id: profile.user_id,
    email: profile.email,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    theme_preference: profile.theme_preference,
    notifications_enabled: profile.notifications_enabled ?? true,
  };
}

export function registerMeRoutes(app: Express, clients: DbClients) {
  const requireAuth = createAuthMiddleware(clients);

  app.get('/api/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    const { data, error } = await clients.supabaseAdmin
      .from('profiles')
      .select('user_id,email,display_name,avatar_url,theme_preference,notifications_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to load profile' });
      return;
    }

    if (!data) {
      const profile = {
        user_id: user.id,
        email: user.email,
        display_name: null,
        avatar_url: null,
        theme_preference: 'light',
        notifications_enabled: true,
      };

      const { data: inserted, error: insertError } = await clients.supabaseAdmin
        .from('profiles')
        .insert(profile)
        .select('user_id,email,display_name,avatar_url,theme_preference,notifications_enabled')
        .single();

      if (insertError || !inserted) {
        res.status(500).json({ success: false, data: null, error: 'Failed to create profile' });
        return;
      }

      res.status(200).json({ success: true, data: toSafeProfile(inserted), error: null });
      return;
    }

    res.status(200).json({ success: true, data: toSafeProfile(data), error: null });
  });

  app.patch('/api/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const body = req.body as {
      display_name?: unknown;
      avatar_url?: unknown;
      theme_preference?: unknown;
      notifications_enabled?: unknown;
    };

    const updates: {
      display_name?: string | null;
      avatar_url?: string | null;
      theme_preference?: string | null;
      notifications_enabled?: boolean | null;
    } = {};

    if (typeof body.display_name === 'string' || body.display_name === null) {
      updates.display_name = body.display_name as string | null;
    }
    if (typeof body.avatar_url === 'string' || body.avatar_url === null) {
      updates.avatar_url = body.avatar_url as string | null;
    }
    if (typeof body.theme_preference === 'string' || body.theme_preference === null) {
      updates.theme_preference = body.theme_preference as string | null;
    }
    if (typeof body.notifications_enabled === 'boolean' || body.notifications_enabled === null) {
      updates.notifications_enabled = body.notifications_enabled as boolean | null;
    }

    const { data, error } = await clients.supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select('user_id,email,display_name,avatar_url,theme_preference,notifications_enabled')
      .single();

    if (error || !data) {
      res.status(500).json({ success: false, data: null, error: 'Failed to update profile' });
      return;
    }

    res.status(200).json({ success: true, data: toSafeProfile(data), error: null });
  });
}
