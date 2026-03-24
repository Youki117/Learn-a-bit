import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Fingerprint, KeyRound, LogOut, Mail, Moon, Settings, User, Bell } from 'lucide-react';
import { cn } from '@/src/types';
import { isValidEmail } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC<{ isDarkMode?: boolean; toggleTheme?: () => void }> = ({ isDarkMode, toggleTheme }) => {
  const { userProfile, loading, error, authNotice, signOut, signInWithPassword, signUpWithPassword, authAvailable, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const displayName = userProfile?.display_name || userProfile?.email?.split('@')[0] || '访客';

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setFormError('请输入有效邮箱');
      return;
    }

    if (!password.trim()) {
      setFormError('请输入密码');
      return;
    }

    setFormError(null);

    try {
      if (authMode === 'sign-in') {
        await signInWithPassword(email.trim(), password);
      } else {
        await signUpWithPassword(email.trim(), password);
      }
      if (authMode === 'sign-in') {
        setPassword('');
      }
    } catch {
      // Context error already stores the visible message.
    }
  };

  if (loading && !isAuthenticated) {
    return <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-6 sm:pt-8">正在加载用户资料...</div>;
  }

  if (!authAvailable) {
    return (
      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-6 sm:pt-8">
        <div className="rounded-3xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm text-on-surface-variant">
          当前环境未配置 Supabase 登录，无法同步正式版学习进度。
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-6 sm:pt-8 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">登录同步进度</h1>
          <div className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-on-surface-variant border border-black/5">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        <motion.form
          onSubmit={handleAuthSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5 relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex rounded-2xl border border-black/10 bg-surface p-1 mb-4">
              <button
                type="button"
                onClick={() => setAuthMode('sign-in')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-headline font-bold transition-colors',
                  authMode === 'sign-in' ? 'primary-gradient text-white' : 'text-on-surface-variant',
                )}
              >
                登录账号
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('sign-up')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-headline font-bold transition-colors',
                  authMode === 'sign-up' ? 'primary-gradient text-white' : 'text-on-surface-variant',
                )}
              >
                注册账号
              </button>
            </div>
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              {authMode === 'sign-in' ? '用你的应用账号登录' : '先注册这个学习应用账号'}
            </h2>
            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
              {authMode === 'sign-in'
                ? '登录后就能把不同领域的关卡进度、选中的文章和学习状态正式保存下来。'
                : '你在 Supabase 控制台注册的账号和这个学习应用是分开的。先在这里注册，再去邮箱确认。'}
            </p>
          </div>

          <label className="block relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">邮箱</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-surface px-4 py-3">
              <Mail className="w-4 h-4 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/60"
              />
            </div>
          </label>

          <label className="block relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">密码</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-surface px-4 py-3">
              <KeyRound className="w-4 h-4 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入你的密码"
                className="w-full bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/60"
              />
            </div>
          </label>

          {(formError || error || authNotice) && (
            <div className={cn(
              'rounded-2xl px-4 py-3 text-sm relative z-10',
              formError || error
                ? 'border border-warning/30 bg-warning/10 text-on-surface-variant'
                : 'border border-primary/20 bg-primary/10 text-on-surface',
            )}>
              {formError || error || authNotice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 primary-gradient text-white rounded-2xl font-headline font-extrabold text-base shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all relative z-10 disabled:opacity-60"
          >
            {loading
              ? authMode === 'sign-in'
                ? '登录中...'
                : '注册中...'
              : authMode === 'sign-in'
                ? '登录并同步学习进度'
                : '注册并发送确认邮件'}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-6 sm:pt-8 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <h1 className="font-headline font-extrabold text-3xl text-on-surface">个人资料</h1>
        <button className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-black/5">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden flex items-center gap-4 sm:gap-6"
      >
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative shrink-0">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[2px]">
            <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-10 h-10 text-on-surface-variant" />
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-surface border border-black/10 rounded-lg px-2 py-0.5 shadow-lg">
            <span className="font-mono text-[10px] font-bold text-primary">已登录</span>
          </div>
        </div>

        <div className="flex-1 relative z-10 min-w-0">
          <h2 className="font-headline font-bold text-2xl text-on-surface truncate">{displayName}</h2>
          <p className="text-on-surface-variant text-sm font-mono mt-1 truncate">{userProfile?.email ?? '未提供邮箱'}</p>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
        <StatCard icon={<Mail className="w-5 h-5 text-primary" />} label="邮箱" value={userProfile?.email ?? '未绑定'} color="bg-primary/10 border-primary/20" />
        <StatCard icon={<Moon className="w-5 h-5 text-secondary" />} label="主题" value={userProfile?.theme_preference ?? 'light'} color="bg-secondary/10 border-secondary/20" />
        <StatCard icon={<Bell className="w-5 h-5 text-tertiary" />} label="通知" value={userProfile?.notifications_enabled ? '开启' : '关闭'} color="bg-tertiary/10 border-tertiary/20" />
        <StatCard icon={<Fingerprint className="w-5 h-5 text-primary" />} label="用户 ID" value={userProfile?.id.slice(0, 8) ?? '—'} color="bg-primary/10 border-primary/20" />
      </div>

      <section className="space-y-4 relative z-10">
        <h3 className="font-headline font-bold text-on-surface text-xl">偏好设置</h3>
        <div className="glass-panel rounded-3xl overflow-hidden">
          <PreferenceItem icon={<Bell />} label="通知" value={userProfile?.notifications_enabled ? '已启用' : '已关闭'} />
          <div className="h-[1px] bg-black/5 mx-4"></div>
          <PreferenceItem icon={<Moon />} label="深色模式" value={isDarkMode ? '开启' : '关闭'} onClick={toggleTheme} />
          <div className="h-[1px] bg-black/5 mx-4"></div>
          <PreferenceItem icon={<LogOut />} label="退出登录" value="" isDestructive onClick={() => void signOut()} />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <motion.div whileHover={{ scale: 1.02 }} className={cn('glass-panel rounded-2xl p-5 flex flex-col gap-3 border transition-colors', color)}>
    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-black/10 shadow-inner">{icon}</div>
    <div>
      <div className="font-headline font-extrabold text-lg text-on-surface truncate">{value}</div>
      <div className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mt-1">{label}</div>
    </div>
  </motion.div>
);

const PreferenceItem = ({
  icon,
  label,
  value,
  isDestructive,
  onClick,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  isDestructive?: boolean;
  onClick?: () => void;
}) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-colors group">
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center border transition-colors',
          isDestructive ? 'bg-error/10 border-error/20 text-error group-hover:bg-error/20' : 'bg-black/5 border-black/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary/30',
        )}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <span className={cn('font-headline font-semibold', isDestructive ? 'text-error' : 'text-on-surface')}>{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-sm text-on-surface-variant font-body">{value}</span>}
      <ChevronRight className={cn('w-5 h-5 transition-colors', isDestructive ? 'text-error/50' : 'text-on-surface-variant group-hover:text-primary')} />
    </div>
  </button>
);
