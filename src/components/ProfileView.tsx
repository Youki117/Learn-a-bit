import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  Bell,
  BookMarked,
  ChevronRight,
  Coins,
  Crown,
  Fingerprint,
  Heart,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  NotebookPen,
  ScrollText,
  Settings,
  ShoppingBag,
  Target,
  Trophy,
  User,
} from 'lucide-react';
import { cn } from '@/src/types';
import { isValidEmail } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { usePlayerMeta } from '../context/PlayerMetaContext';

type PanelKey = 'wallet' | 'progress' | 'notes' | 'wrong' | 'favorites' | 'titles' | 'shop' | null;

const SHOP_ITEMS = [
  { id: 'theme-cyan', name: '深海光谱主题', price: 800, desc: '替换部分次级高光色，先做壳子展示。' },
  { id: 'note-pack', name: '灵感便签套件', price: 1200, desc: '后续会扩展为更强的笔记模板能力。' },
  { id: 'boost-xp', name: '双倍洞察卡', price: 3000, desc: '后续可与活动奖励绑定。' },
];

export const ProfileView: React.FC<{ isDarkMode?: boolean; toggleTheme?: () => void }> = ({ isDarkMode, toggleTheme }) => {
  const {
    userProfile,
    loading,
    error,
    authNotice,
    signOut,
    signInWithPassword,
    signUpWithPassword,
    authAvailable,
    isAuthenticated,
  } = useAuth();
  const { meta, titleHall } = usePlayerMeta();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [panel, setPanel] = useState<PanelKey>(null);
  const displayName = userProfile?.display_name || userProfile?.email?.split('@')[0] || '访客';

  const articleMilestone = useMemo(() => {
    if (meta.completedArticles < 10) return { current: meta.completedArticles, target: 10, label: '博学轨' };
    if (meta.completedArticles < 100) return { current: meta.completedArticles, target: 100, label: '洞见轨' };
    return { current: meta.completedArticles, target: meta.completedArticles, label: '殿堂轨' };
  }, [meta.completedArticles]);

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
      // Context error already provides the display message.
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
                ? '登录后就能把不同领域的关卡进度、金币记录和学习资产同步下来。'
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
            <div
              className={cn(
                'rounded-2xl px-4 py-3 text-sm relative z-10',
                formError || error
                  ? 'border border-warning/30 bg-warning/10 text-on-surface-variant'
                  : 'border border-primary/20 bg-primary/10 text-on-surface',
              )}
            >
              {formError || error || authNotice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 primary-gradient text-white rounded-2xl font-headline font-extrabold text-base shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all relative z-10 disabled:opacity-60"
          >
            {loading ? (authMode === 'sign-in' ? '登录中...' : '注册中...') : authMode === 'sign-in' ? '登录并同步学习进度' : '注册并发送确认邮件'}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-8 pb-32 pt-6 sm:pt-8 relative">
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <h1 className="font-headline font-extrabold text-3xl text-on-surface">个人资料</h1>
        <button className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-black/5">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[2rem] p-5 sm:p-6 space-y-5 relative overflow-hidden"
      >
        <div className="absolute -right-14 -top-14 w-40 h-40 bg-primary/12 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_20px_rgba(79,70,229,0.15)]">
            <div className="w-full h-full bg-surface rounded-[1.6rem] flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-10 h-10 text-on-surface-variant" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-on-surface text-white px-3 py-1 text-[10px] font-headline font-bold tracking-[0.18em] uppercase shadow-sm">
              <BadgeCheck className="w-3 h-3" />
              {titleHall.currentTitle}
            </div>
            <h2 className="font-headline font-black text-3xl text-on-surface mt-3 truncate">{displayName}</h2>
            <p className="text-on-surface-variant text-sm mt-1 truncate">{userProfile?.email ?? '未提供邮箱'}</p>
          </div>
        </div>

        <button
          onClick={() => setPanel('wallet')}
          className="w-full rounded-3xl border border-black/5 bg-surface/75 px-4 py-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-warning/12 border border-warning/20 flex items-center justify-center text-warning">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-on-surface-variant font-medium">信用币余额</div>
              <div className="font-headline font-black text-2xl text-on-surface mt-0.5">{meta.coins.toLocaleString()}</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-surface-variant" />
        </button>
      </motion.section>

      <section className="space-y-4 relative z-10">
        <h3 className="font-headline font-black text-2xl text-on-surface">成长进度</h3>
        <div className="space-y-3">
          <TrackCard
            icon={<BookMarked className="w-5 h-5 text-primary" />}
            title="博学轨"
            subtitle={`当前已读：${meta.completedArticles}`}
            progress={articleMilestone.target === 0 ? 1 : Math.min(meta.completedArticles / articleMilestone.target, 1)}
            accent="from-primary to-secondary"
            onClick={() => setPanel('progress')}
          />
          <TrackCard
            icon={<Trophy className="w-5 h-5 text-warning" />}
            title="洞见轨"
            subtitle={`当前满星：${meta.perfectQuizRuns}`}
            progress={Math.min(meta.perfectQuizRuns / 10, 1)}
            accent="from-warning to-secondary"
            onClick={() => setPanel('titles')}
          />
        </div>
      </section>

      <section className="relative z-10">
        <div className="glass-panel rounded-[2rem] overflow-hidden">
          <EntryRow icon={<NotebookPen />} title="我的笔记" desc="查看所有笔记" value={String(meta.notes.length)} onClick={() => setPanel('notes')} />
          <Divider />
          <EntryRow icon={<Target />} title="错题本" desc="复习错题" value={String(meta.wrongItems.length)} onClick={() => setPanel('wrong')} />
          <Divider />
          <EntryRow icon={<Heart />} title="我的收藏" desc="收藏的文章" value={String(meta.favorites.length)} onClick={() => setPanel('favorites')} />
          <Divider />
          <EntryRow icon={<Crown />} title="荣誉殿堂" desc="称号与成就" value={String(titleHall.unlockedTitles.length)} onClick={() => setPanel('titles')} />
          <Divider />
          <EntryRow icon={<ShoppingBag />} title="信用币商城" desc="先做壳子展示" value="壳子" onClick={() => setPanel('shop')} />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
          {error}
        </div>
      )}

      <section className="space-y-4 relative z-10">
        <h3 className="font-headline font-bold text-on-surface text-xl">偏好设置</h3>
        <div className="glass-panel rounded-3xl overflow-hidden">
          <PreferenceItem icon={<Bell />} label="通知" value={userProfile?.notifications_enabled ? '已启用' : '已关闭'} />
          <Divider />
          <PreferenceItem icon={<Moon />} label="深色模式" value={isDarkMode ? '开启' : '关闭'} onClick={toggleTheme} />
          <Divider />
          <PreferenceItem icon={<Fingerprint />} label="用户 ID" value={userProfile?.id.slice(0, 8) ?? '—'} />
          <Divider />
          <PreferenceItem icon={<LogOut />} label="退出登录" value="" isDestructive onClick={() => void signOut()} />
        </div>
      </section>

      <PanelSheet title="信用币余额" open={panel === 'wallet'} onClose={() => setPanel(null)}>
        <PanelMetric label="当前余额" value={`${meta.coins.toLocaleString()} 币`} />
        <PanelMetric label="已完成文章" value={`${meta.completedArticles}`} />
        <PanelMetric label="预测题胜场" value={`${meta.predictionWins}`} />
        <PanelMetric label="预测题败场" value={`${meta.predictionLosses}`} />
      </PanelSheet>

      <PanelSheet title="成长进度" open={panel === 'progress'} onClose={() => setPanel(null)}>
        <PanelMetric label="博学轨" value={`${meta.completedArticles} / ${articleMilestone.target}`} />
        <PanelMetric label="洞见轨" value={`${meta.perfectQuizRuns} / 10`} />
      </PanelSheet>

      <PanelSheet title="我的笔记" open={panel === 'notes'} onClose={() => setPanel(null)}>
        {meta.notes.length ? meta.notes.map((note) => (
          <PanelListItem key={note.articleId} title={note.title} desc={`${note.domain} · ${note.content.slice(0, 60) || '暂无内容'}`} />
        )) : <PanelEmpty text="还没有笔记，去阅读页写下第一条。" />}
      </PanelSheet>

      <PanelSheet title="错题本" open={panel === 'wrong'} onClose={() => setPanel(null)}>
        {meta.wrongItems.length ? meta.wrongItems.map((item) => (
          <PanelListItem key={item.eventId} title={item.prompt} desc={`${item.domain} · ${item.source === 'prediction' ? '预测题' : '检测题'}`} />
        )) : <PanelEmpty text="目前没有错题，继续保持。" />}
      </PanelSheet>

      <PanelSheet title="我的收藏" open={panel === 'favorites'} onClose={() => setPanel(null)}>
        {meta.favorites.length ? meta.favorites.map((item) => (
          <PanelListItem key={item.articleId} title={item.title} desc={`${item.domain} · 已收藏`} />
        )) : <PanelEmpty text="你还没有收藏文章。" />}
      </PanelSheet>

      <PanelSheet title="荣誉殿堂" open={panel === 'titles'} onClose={() => setPanel(null)}>
        {titleHall.unlockedTitles.map((title) => (
          <PanelListItem key={title} title={title} desc={title === titleHall.currentTitle ? '当前佩戴中' : '已解锁'} />
        ))}
      </PanelSheet>

      <PanelSheet title="信用币商城" open={panel === 'shop'} onClose={() => setPanel(null)}>
        {SHOP_ITEMS.map((item) => (
          <PanelListItem key={item.id} title={`${item.name} · ${item.price} 币`} desc={item.desc} />
        ))}
      </PanelSheet>
    </div>
  );
};

const TrackCard = ({
  icon,
  title,
  subtitle,
  progress,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  progress: number;
  accent: string;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="w-full glass-panel rounded-3xl p-4 text-left">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center">{icon}</div>
      <div className="flex-1">
        <div className="font-headline font-bold text-on-surface">{title}</div>
        <div className="text-xs text-on-surface-variant mt-0.5">{subtitle}</div>
      </div>
    </div>
    <div className="mt-4 h-2 rounded-full bg-black/5 overflow-hidden">
      <div className={cn('h-full rounded-full bg-gradient-to-r', accent)} style={{ width: `${Math.max(progress * 100, 6)}%` }} />
    </div>
  </button>
);

const EntryRow = ({
  icon,
  title,
  desc,
  value,
  onClick,
}: {
  icon: React.ReactElement;
  title: string;
  desc: string;
  value: string;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/10 bg-black/5 text-on-surface-variant">
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <div className="text-left">
        <div className="font-headline font-semibold text-on-surface">{title}</div>
        <div className="text-sm text-on-surface-variant">{desc}</div>
      </div>
    </div>
    <div className="flex items-center gap-2 text-on-surface-variant">
      <span className="text-sm font-mono">{value}</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  </button>
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
          isDestructive
            ? 'bg-error/10 border-error/20 text-error group-hover:bg-error/20'
            : 'bg-black/5 border-black/10 text-on-surface-variant',
        )}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <span className={cn('font-headline font-semibold', isDestructive ? 'text-error' : 'text-on-surface')}>{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-sm text-on-surface-variant font-body">{value}</span>}
      <ChevronRight className={cn('w-5 h-5 transition-colors', isDestructive ? 'text-error/50' : 'text-on-surface-variant')} />
    </div>
  </button>
);

const Divider = () => <div className="h-px bg-black/5 mx-4" />;

const PanelSheet = ({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center px-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        className="relative w-full max-w-[430px] rounded-t-[2rem] bg-surface p-5 pb-8 border-t border-black/5 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] max-h-[75vh] overflow-y-auto no-scrollbar"
      >
        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-headline font-black text-xl text-on-surface">{title}</h4>
          <button onClick={onClose} className="text-sm text-on-surface-variant">关闭</button>
        </div>
        <div className="space-y-3">{children}</div>
      </motion.div>
    </div>
  );
};

const PanelMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-black/5 bg-surface/75 px-4 py-3">
    <div className="text-xs font-mono uppercase tracking-[0.18em] text-on-surface-variant">{label}</div>
    <div className="mt-2 font-headline font-black text-2xl text-on-surface">{value}</div>
  </div>
);

const PanelListItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="rounded-2xl border border-black/5 bg-surface/75 px-4 py-3">
    <div className="font-headline font-bold text-on-surface">{title}</div>
    <div className="text-sm text-on-surface-variant mt-1">{desc}</div>
  </div>
);

const PanelEmpty = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-sm text-on-surface-variant">
    {text}
  </div>
);
