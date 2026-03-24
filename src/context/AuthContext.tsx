import { createClient, type Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readClientEnv } from '../lib/env';
import { getFriendlyAuthErrorMessage } from '../lib/auth';
import { fetchCurrentUser } from '../services/api';
import type { UserProfileSummary } from '../types/api';

type AuthContextValue = {
  session: Session | null;
  userProfile: UserProfileSummary | null;
  loading: boolean;
  error: string | null;
  authNotice: string | null;
  authAvailable: boolean;
  isAuthenticated: boolean;
  refreshUserProfile: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildFallbackProfile(session: Session | null): UserProfileSummary | null {
  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    display_name: session.user.email?.split('@')[0] ?? '用户',
    avatar_url: session.user.user_metadata?.avatar_url ?? null,
    theme_preference: 'light',
    notifications_enabled: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = useMemo(() => readClientEnv(), []);
  const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
  const supabase = useMemo(
    () => (hasSupabaseConfig ? createClient(env.supabaseUrl!, env.supabaseAnonKey!) : null),
    [env.supabaseAnonKey, env.supabaseUrl, hasSupabaseConfig],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const refreshUserProfile = useCallback(async (targetSession?: Session | null) => {
    if (!supabase) {
      setSession(null);
      setUserProfile(null);
      setError(null);
      setAuthNotice(null);
      setLoading(false);
      return;
    }

    const activeSession = targetSession ?? session;
    const accessToken = activeSession?.access_token;
    if (!accessToken) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setAuthNotice(null);
      const profile = await fetchCurrentUser<UserProfileSummary>(accessToken);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
      setUserProfile(buildFallbackProfile(activeSession));
    } finally {
      setLoading(false);
    }
  }, [session, supabase]);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setUserProfile(buildFallbackProfile(data.session));
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUserProfile(buildFallbackProfile(nextSession));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    void refreshUserProfile();
  }, [refreshUserProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase auth is not configured');
    }

    setLoading(true);
    setError(null);
    setAuthNotice(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const message = getFriendlyAuthErrorMessage(authError.message);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    setSession(data.session);
    setUserProfile(buildFallbackProfile(data.session));
    await refreshUserProfile(data.session);
  }, [refreshUserProfile, supabase]);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase auth is not configured');
    }

    setLoading(true);
    setError(null);
    setAuthNotice(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      const message = getFriendlyAuthErrorMessage(authError.message);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }

    setSession(data.session);
    setUserProfile(buildFallbackProfile(data.session));

    if (!data.session) {
      setAuthNotice('注册成功，请先去邮箱点击确认链接，再回来登录。');
      setLoading(false);
      return;
    }

    setAuthNotice('注册成功，已自动登录。');
    await refreshUserProfile(data.session);
  }, [refreshUserProfile, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setUserProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setError(null);
    setAuthNotice(null);
  }, [supabase]);

  const value: AuthContextValue = {
    session,
    userProfile,
    loading,
    error,
    authNotice,
    authAvailable: hasSupabaseConfig,
    isAuthenticated: Boolean(session),
    refreshUserProfile: () => refreshUserProfile(),
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
